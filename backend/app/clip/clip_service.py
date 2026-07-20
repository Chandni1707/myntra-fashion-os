from pathlib import Path

import open_clip
import torch
import numpy as np
from PIL import Image

# -----------------------------
# Device
# -----------------------------
if torch.backends.mps.is_available():
    DEVICE = "mps"
elif torch.cuda.is_available():
    DEVICE = "cuda"
else:
    DEVICE = "cpu"

print(f"Loading OpenCLIP on {DEVICE}...")

# -----------------------------
# Load Model
# -----------------------------
model, _, preprocess = open_clip.create_model_and_transforms(
    "ViT-B-32",
    pretrained="laion2b_s34b_b79k",
)

model = model.to(DEVICE)
model.eval()


class ClipService:

    def encode_image(self, image: Image.Image) -> np.ndarray:
        """
        Convert a PIL image into a normalized CLIP embedding.
        """

        image_tensor = preprocess(image).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            embedding = model.encode_image(image_tensor)

        embedding = embedding / embedding.norm(dim=-1, keepdim=True)

        return embedding.cpu().numpy().astype(np.float32)


# Singleton
clip_service = ClipService()