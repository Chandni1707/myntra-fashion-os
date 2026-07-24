from datetime import datetime, timezone
from app.services.video_downloader import download_video
import os
from fastapi import APIRouter, Depends, File, UploadFile, status

from app.database import database
from app.schemas.capture import ImageURLRequest, VideoURLRequest
from app.services.file_handler import save_upload_file
from app.utils.auth import get_current_user
from app.schemas.capture import (
    ImageURLRequest,
    VideoURLRequest,
    TransformPromptRequest,
)
from bson import ObjectId
from fastapi import HTTPException

from app.services.intent_parser import parse_fashion_intent
from app.services.fashion_analyzer import analyze_fashion_image
from app.services.recommendation_engine import recommend_outfit
from PIL import Image
from app.services.visual_retriever import retrieve_visual_candidates
import traceback
from app.services.image_downloader import download_image
from app.services.video_utils import extract_frames
import tempfile
import os
import requests


router = APIRouter(
    prefix="/api/captures",
    tags=["Universal Fashion Capture"],
)


@router.post(
    "/image",
    status_code=status.HTTP_201_CREATED,
)
async def upload_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    file_data = await save_upload_file(
        file=file,
        upload_type="image",
    )

    capture_document = {
        "user_id": current_user["_id"],
        "input_type": "image",
        "source": {
            "type": "upload",
            "filename": file_data["filename"],
            "original_filename": file_data["original_filename"],
            "content_type": file_data["content_type"],
            "size_bytes": file_data["size_bytes"],
            "file_path": file_data["file_path"],
        },
        "status": "uploaded",
        "analysis": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = database.captures.insert_one(capture_document)

    return {
        "message": "Image uploaded successfully",
        "capture": {
            "id": str(result.inserted_id),
            "input_type": "image",
            "status": "uploaded",
            "filename": file_data["filename"],
        },
    }


@router.post(
    "/video",
    status_code=status.HTTP_201_CREATED,
)
async def upload_video(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    file_data = await save_upload_file(
        file=file,
        upload_type="video",
    )

    capture_document = {
        "user_id": current_user["_id"],
        "input_type": "video",
        "source": {
            "type": "upload",
            "filename": file_data["filename"],
            "original_filename": file_data["original_filename"],
            "content_type": file_data["content_type"],
            "size_bytes": file_data["size_bytes"],
            "file_path": file_data["file_path"],
        },
        "status": "uploaded",
        "analysis": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = database.captures.insert_one(capture_document)

    return {
        "message": "Video uploaded successfully",
        "capture": {
            "id": str(result.inserted_id),
            "input_type": "video",
            "status": "uploaded",
            "filename": file_data["filename"],
        },
    }


@router.post(
    "/video-url",
    status_code=status.HTTP_201_CREATED,
)
def submit_video_url(
    request: VideoURLRequest,
    current_user=Depends(get_current_user),
):
    capture_document = {
        "user_id": current_user["_id"],
        "input_type": "video_url",
        "source": {
            "type": "url",
            "url": str(request.url),
        },
        "status": "pending_retrieval",
        "analysis": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = database.captures.insert_one(capture_document)

    return {
        "message": "Video URL submitted successfully",
        "capture": {
            "id": str(result.inserted_id),
            "input_type": "video_url",
            "status": "pending_retrieval",
            "url": str(request.url),
        },
    }
@router.post(
    "/image-url",
    status_code=status.HTTP_201_CREATED,
)
def submit_image_url(
    request: ImageURLRequest,
    current_user=Depends(get_current_user),
):
    capture_document = {
        "user_id": current_user["_id"],
        "input_type": "image_url",

        "source": {
            "type": "url",
            "url": str(request.url),
        },

        "status": "pending_retrieval",
        "analysis": None,

        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = database.captures.insert_one(capture_document)

    return {
        "message": "Image URL submitted successfully",

        "capture": {
            "id": str(result.inserted_id),
            "input_type": "image_url",
            "status": "pending_retrieval",
            "url": str(request.url),
        },
    }

@router.post("/{capture_id}/transform")
def transform_capture(
    capture_id: str,
    request: TransformPromptRequest,
    current_user=Depends(get_current_user),
):
    if not ObjectId.is_valid(capture_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid capture ID",
        )

    capture = database.captures.find_one({
        "_id": ObjectId(capture_id),
        "user_id": current_user["_id"],
    })

    if not capture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Capture not found",
        )

    parsed_intent = parse_fashion_intent(request.prompt)

    database.captures.update_one(
        {
            "_id": capture["_id"]
        },
        {
            "$set": {
                "transformation_request": {
                    "prompt": request.prompt,
                    "parsed_intent": parsed_intent,
                    "status": "intent_parsed",
                    "created_at": datetime.now(timezone.utc),
                },
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {
        "message": "Fashion instruction understood successfully",
        "capture_id": capture_id,
        "parsed_intent": parsed_intent,
    }

def get_image_path_for_analysis(capture):
    input_type = capture["input_type"]

    # Uploaded image
    if input_type == "image":
        return capture["source"]["file_path"]

    # Uploaded video
    elif input_type == "video":
        video_path = capture["source"]["file_path"]
        return extract_frames(video_path)

    # Image URL
    elif input_type == "image_url":
        url = capture["source"]["url"]
        return download_image(url)

    # Video URL
    elif input_type == "video_url":

        url = capture["source"]["url"]

        video_path = download_video(url)
        return extract_frames(video_path)

        

    raise ValueError("Unsupported capture type")

@router.post("/{capture_id}/analyze")
def analyze_capture(
    capture_id: str,
    current_user=Depends(get_current_user),
):
    if not ObjectId.is_valid(capture_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid capture ID",
        )

    capture = database.captures.find_one(
        {
            "_id": ObjectId(capture_id),
            "user_id": current_user["_id"],
        }
    )

    if not capture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Capture not found",
        )

    try:
        image_path = get_image_path_for_analysis(capture)

    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to prepare media for analysis: {exc}",
        )

    try:
        if isinstance(image_path, list):

            analyses = []

            for frame in image_path:
                analyses.append(analyze_fashion_image(frame))

            merged_items = []
            merged_colors = set()

            for result in analyses:

                for item in result.get("items", []):

                    if item not in merged_items:
                        merged_items.append(item)

                    color = item.get("color")

                    if color:
                        merged_colors.add(color)

            analysis = {
                "overall_description": analyses[0].get("overall_description",""),
                "dominant_colors": list(merged_colors),
                "items": merged_items,
            }

        else:
            analysis = analyze_fashion_image(image_path)

    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded image file was not found",
        )

    except Exception as exc:
        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    database.captures.update_one(
        {"_id": capture["_id"]},
        {
            "$set": {
                "analysis": analysis,
                "analysis_image": image_path,
                "status": "analyzed",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    return {
        "message": "Fashion image analyzed successfully",
        "capture_id": capture_id,
        "analysis": analysis,
    }
@router.post("/{capture_id}/recommend")
def recommend_capture_outfit(
    capture_id: str,
    current_user=Depends(get_current_user),
):
    # -----------------------------------------------------
    # Validate capture ID
    # -----------------------------------------------------

    if not ObjectId.is_valid(capture_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid capture ID",
        )

    # -----------------------------------------------------
    # Find capture belonging to current user
    # -----------------------------------------------------

    capture = database.captures.find_one(
        {
            "_id": ObjectId(capture_id),
            "user_id": current_user["_id"],
        }
    )

    if not capture:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Capture not found",
        )

    # -----------------------------------------------------
    # Require AI analysis
    # -----------------------------------------------------

    analysis = capture.get("analysis")
    image_path = capture.get(
    "analysis_image",
    capture["source"].get("file_path"),
)

    if isinstance(image_path, str):

        image = Image.open(image_path).convert("RGB")

        visual_scores = retrieve_visual_candidates(
            image=image,
            top_k=100,
        )

    else:

        merged_scores = {}

        for frame in image_path:

            image = Image.open(frame).convert("RGB")

            scores = retrieve_visual_candidates(
                image=image,
                top_k=100,
            )

            for pid, score in scores.items():

                merged_scores[pid] = max(
                    merged_scores.get(pid, 0),
                    score,
                )

        visual_scores = merged_scores

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This capture has not been analyzed yet. "
                "Analyze the image before requesting recommendations."
            ),
        )

    # -----------------------------------------------------
    # Require transformation prompt
    # -----------------------------------------------------

    transformation_request = capture.get(
        "transformation_request"
    )

    if not transformation_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "No fashion instruction found. "
                "Submit a transformation prompt first."
            ),
        )

    parsed_intent = transformation_request.get(
        "parsed_intent"
    )

    if not parsed_intent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Fashion instruction has not been parsed yet.",
        )

    # -----------------------------------------------------
    # Load current user's saved preferences
    # -----------------------------------------------------

    user_document = database.users.find_one(
        {
            "_id": current_user["_id"],
        }
    )

    saved_preferences = {}

    if user_document:
        saved_preferences = user_document.get("preferences", {})

    user_preferences = {
        "preferred_styles": saved_preferences.get("styles", []),
        "preferred_colors": saved_preferences.get("colors", []),
        "preferred_fit": saved_preferences.get("fit"),
        "default_budget": saved_preferences.get("default_budget"),
        "preferred_gender": saved_preferences.get("preferred_gender"),
    }

    # -----------------------------------------------------
    # Generate recommendation
    # -----------------------------------------------------

    try:
        recommendation = recommend_outfit(
            parsed_intent=parsed_intent,
            user_preferences=user_preferences,
            analysis=analysis,
            visual_scores=visual_scores,
        )

    except FileNotFoundError as exc:
        print(f"Catalogue error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Product catalogue could not be found.",
        )

    except ValueError as exc:
        print(f"Catalogue validation error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Product catalogue format is invalid.",
        )

    except Exception as exc:
        traceback.print_exc()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    # -----------------------------------------------------
    # Save recommendation to MongoDB
    # -----------------------------------------------------

    database.captures.update_one(
        {
            "_id": capture["_id"],
        },
        {
            "$set": {
                "recommendation": recommendation,
                "status": "recommended",
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    # -----------------------------------------------------
    # Cleanup temporary files
    # -----------------------------------------------------

    analysis_image = capture.get("analysis_image")

    if isinstance(analysis_image, str):

        if capture["input_type"] != "image" and os.path.exists(analysis_image):
            try:
                os.remove(analysis_image)
            except Exception:
                pass

    elif isinstance(analysis_image, list):

        for frame in analysis_image:
            if os.path.exists(frame):
                try:
                    os.remove(frame)
                except Exception:
                    pass

    video_path = capture["source"].get("file_path")

    if (
        capture["input_type"] in ["video", "video_url"]
        and video_path
        and os.path.exists(video_path)
    ):
        try:
            os.remove(video_path)
        except Exception:
            pass

    # -----------------------------------------------------
    # Return final result
    # -----------------------------------------------------

    return {
        "message": "Personalized outfit generated successfully",
        "capture_id": capture_id,
        "recommendation": recommendation,
    }
