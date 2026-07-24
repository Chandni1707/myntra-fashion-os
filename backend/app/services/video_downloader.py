import os
import uuid
import requests
from yt_dlp import YoutubeDL

DOWNLOAD_DIR = "uploads/videos"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def download_video(url: str) -> str:
    """
    Downloads a video from either:
      • Direct MP4 URL
      • YouTube
      • Instagram Reel
      • TikTok
      • Vimeo
      • etc.
    Returns local file path.
    """

    # Direct video file
    if url.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".webm")):

        filename = f"{uuid.uuid4()}.mp4"

        filepath = os.path.join(DOWNLOAD_DIR, filename)

        response = requests.get(url, stream=True, timeout=60)
        response.raise_for_status()

        with open(filepath, "wb") as f:
            for chunk in response.iter_content(1024 * 1024):
                if chunk:
                    f.write(chunk)

        return filepath

    # Social media / YouTube
    ydl_opts = {
        "format": "best",
        "quiet": True,
        "outtmpl": os.path.join(
            DOWNLOAD_DIR,
            "%(id)s.%(ext)s",
        ),
        "noplaylist": True,
        "merge_output_format": "mp4",
    }

    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        return ydl.prepare_filename(info)