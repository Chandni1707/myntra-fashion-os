import os
import uuid
import requests


UPLOAD_DIR = "uploads/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def download_image(url: str) -> str:
    response = requests.get(url, timeout=30)
    response.raise_for_status()

    ext = ".jpg"

    content_type = response.headers.get("content-type", "")

    if "png" in content_type:
        ext = ".png"

    filename = f"{uuid.uuid4()}{ext}"

    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        f.write(response.content)

    return path