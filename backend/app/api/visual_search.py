from fastapi import APIRouter, UploadFile, File
from PIL import Image
from io import BytesIO

from app.clip.visual_search_service import visual_search_service

router = APIRouter(
    prefix="/visual-search",
    tags=["Visual Search"]
)


@router.post("/")
async def visual_search(file: UploadFile = File(...)):

    image_bytes = await file.read()

    image = Image.open(
        BytesIO(image_bytes)
    ).convert("RGB")

    results = visual_search_service.search(
        image=image,
        top_k=5
    )

    return {
        "success": True,
        "results": results
    }