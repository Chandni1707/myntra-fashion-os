from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.database import database
from app.schemas.capture import ImageURLRequest, VideoURLRequest
from app.services.file_handler import save_upload_file
from app.utils.auth import get_current_user


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