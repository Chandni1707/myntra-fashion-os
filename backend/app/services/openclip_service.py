from functools import lru_cache
from pathlib import Path

import open_clip
import torch
from PIL import Image


MODEL_NAME = "ViT-B-32"
PRETRAINED = "laion2b_s34b_b79k"


def get_device():

    if torch.cuda.is_available():
        return "cuda"

    if (
        hasattr(torch.backends, "mps")
        and torch.backends.mps.is_available()
    ):
        return "mps"

    return "cpu"


@lru_cache(maxsize=1)
def load_openclip():

    device = get_device()

    model, _, preprocess = open_clip.create_model_and_transforms(
        MODEL_NAME,
        pretrained=PRETRAINED,
    )

    tokenizer = open_clip.get_tokenizer(MODEL_NAME)

    model.to(device)
    model.eval()

    print("OpenCLIP loaded.")

    return model, preprocess, tokenizer, device


def image_embedding(image_path: str):

    model, preprocess, _, device = load_openclip()

    image = preprocess(
        Image.open(image_path).convert("RGB")
    ).unsqueeze(0).to(device)

    with torch.no_grad():

        features = model.encode_image(image)

        features /= features.norm(
            dim=-1,
            keepdim=True,
        )

    return features.cpu().numpy()[0]


def text_embedding(text: str):

    model, _, tokenizer, device = load_openclip()

    tokens = tokenizer([text]).to(device)

    with torch.no_grad():

        features = model.encode_text(tokens)

        features /= features.norm(
            dim=-1,
            keepdim=True,
        )

    return features.cpu().numpy()[0]