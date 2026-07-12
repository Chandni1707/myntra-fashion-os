from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status


BASE_UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"

IMAGE_UPLOAD_DIR = BASE_UPLOAD_DIR / "images"
VIDEO_UPLOAD_DIR = BASE_UPLOAD_DIR / "videos"


IMAGE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/quicktime",
    "video/webm",
}


MAX_IMAGE_SIZE = 10 * 1024 * 1024
MAX_VIDEO_SIZE = 200 * 1024 * 1024


async def save_upload_file(
    file: UploadFile,
    upload_type: str,
) -> dict:

    if upload_type == "image":
        allowed_types = ALLOWED_IMAGE_TYPES
        max_size = MAX_IMAGE_SIZE
        upload_directory = IMAGE_UPLOAD_DIR

    elif upload_type == "video":
        allowed_types = ALLOWED_VIDEO_TYPES
        max_size = MAX_VIDEO_SIZE
        upload_directory = VIDEO_UPLOAD_DIR

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid upload type",
        )

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported {upload_type} format",
        )

    content = await file.read()

    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"{upload_type.capitalize()} file is too large",
        )

    original_suffix = Path(file.filename or "").suffix.lower()

    if not original_suffix:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File extension is missing",
        )

    unique_filename = f"{uuid4().hex}{original_suffix}"

    file_path = upload_directory / unique_filename

    with open(file_path, "wb") as destination:
        destination.write(content)

    return {
        "filename": unique_filename,
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size_bytes": len(content),
        "file_path": str(file_path),
    }