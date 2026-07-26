from functools import lru_cache
from pathlib import Path

import torch
from PIL import Image
from transformers import BlipForConditionalGeneration, BlipProcessor


MODEL_NAME = "Salesforce/blip-image-captioning-base"


COLORS = [
    "black",
    "white",
    "blue",
    "red",
    "green",
    "yellow",
    "pink",
    "purple",
    "orange",
    "brown",
    "beige",
    "grey",
    "gray",
    "navy",
    "maroon",
    "cream",
    "gold",
    "silver",
]


FASHION_ITEMS = {
    "top": [
       "shirt",
    "t-shirt",
    "oversized t-shirt",
    "graphic tee",
    "tank top",
    "cami",
    "camisole",
    "henley",
    "polo",
    "crop top",
    "kurti",
    "kurta",
    "hoodie",
    "sweatshirt",
    "blazer"
    ],

    "bottom": [
         "cargo pants",
    "cargo",
    "joggers",
    "jeans",
    "wide leg jeans",
    "mom jeans",
    "skinny jeans",
    "straight jeans",
    "flared jeans",
    "leggings",
    "palazzo",
    "trousers",
    "shorts",
    "skirt"
    ],

    "dress": [
        "dress",
        "gown",
        "saree",
        "sari",
        "jumpsuit",
    ],

    "outerwear": [
        "jacket",
        "blazer",
        "coat",
        "cardigan",
    ],

    "footwear": [
        "shoes",
        "sneakers",
        "heels",
        "sandals",
        "boots",
        "flats",
    ],

    "accessory": [
        "bag",
        "handbag",
        "purse",
        "necklace",
        "earrings",
        "bracelet",
        "watch",
        "belt",
        "sunglasses",
        "scarf",
    ],
}


AESTHETIC_RULES = {
    "casual": [
        "jeans",
        "t-shirt",
        "tshirt",
        "sneakers",
        "hoodie",
    ],

    "formal": [
        "blazer",
        "formal",
        "suit",
        "trousers",
    ],

    "ethnic": [
        "kurta",
        "kurti",
        "saree",
        "sari",
        "lehenga",
        "ethnic",
    ],

    "streetwear": [
        "oversized",
        "hoodie",
        "cargo",
        "streetwear",
    ],

    "elegant": [
        "gown",
        "heels",
        "elegant",
        "silk",
    ],
}
FIT_RULES = {
    "oversized": "oversized",
    "slim": "slim",
    "skinny": "slim",
    "regular": "regular",
    "relaxed": "relaxed",
    "loose": "loose",
    "wide-leg": "wide-leg",
    "bootcut": "bootcut",
    "straight": "straight",
}

SLEEVE_RULES = {
    "long sleeve": "long",
    "full sleeve": "long",
    "short sleeve": "short",
    "half sleeve": "half",
    "sleeveless": "sleeveless",
    "three-quarter": "3/4",
}

PATTERN_RULES = {
    "solid": "solid",
    "printed": "printed",
    "striped": "striped",
    "checked": "checked",
    "check": "checked",
    "floral": "floral",
    "embroidered": "embroidered",
    "sequinned": "sequinned",
    "lace": "lace",
}

NECKLINE_RULES = {
    "v-neck": "v-neck",
    "round neck": "round",
    "boat neck": "boat",
    "collared": "collared",
    "shirt collar": "collared",
    "off-shoulder": "off-shoulder",
}

SILHOUETTE_RULES = {
    "wrap": "wrap",
    "a-line": "a-line",
    "fit and flare": "fit-and-flare",
    "bodycon": "bodycon",
    "shift": "shift",
    "maxi": "maxi",
    "mini": "mini",
    "layered": "layered",
}


def get_device():
    if torch.cuda.is_available():
        return torch.device("cuda")

    if hasattr(torch.backends, "mps"):
        if torch.backends.mps.is_available():
            return torch.device("mps")

    return torch.device("cpu")


@lru_cache(maxsize=1)
def load_blip_model():
    device = get_device()

    print(f"Loading BLIP model on: {device}")

    processor = BlipProcessor.from_pretrained(MODEL_NAME)

    model = BlipForConditionalGeneration.from_pretrained(
        MODEL_NAME
    )

    model = model.to(device)
    model.eval()

    print("BLIP model loaded successfully.")

    return processor, model, device


def find_color_before_item(caption, item):
    words = caption.lower().split()
    item_words = item.lower().split()

    for index in range(len(words)):
        if words[index:index + len(item_words)] == item_words:

            start = max(0, index - 3)

            previous_words = words[start:index]

            for word in reversed(previous_words):
                clean_word = word.strip(".,!?")

                if clean_word in COLORS:
                    return clean_word

    return None


def extract_fashion_items(caption):

    caption_lower = caption.lower()

    detected_items = []
    seen = set()

    for category, item_names in FASHION_ITEMS.items():

        for item_name in sorted(item_names,key=len,reverse=True,):

            if item_name in caption_lower:

                key = (category, item_name)

                if key in seen:
                    continue

                seen.add(key)

                detected_items.append({
                    "category": category,
                    "subcategory": item_name,
                    "color": find_color_before_item(
                        caption_lower,
                        item_name,
                    ),
                })

    return detected_items

def extract_aesthetics(caption):
    caption_lower = caption.lower()

    detected_aesthetics = []

    for aesthetic, keywords in AESTHETIC_RULES.items():

        if any(
            keyword in caption_lower
            for keyword in keywords
        ):
            detected_aesthetics.append(aesthetic)

    return detected_aesthetics
def extract_attributes(caption: str):

    caption = caption.lower()

    attributes = {
        "fit": [],
        "sleeve": [],
        "pattern": [],
        "neckline": [],
        "silhouette": [],
    }

    for key, value in FIT_RULES.items():
        if key in caption:
            attributes["fit"].append(value)

    for key, value in SLEEVE_RULES.items():
        if key in caption:
            attributes["sleeve"].append(value)

    for key, value in PATTERN_RULES.items():
        if key in caption:
            attributes["pattern"].append(value)

    for key, value in NECKLINE_RULES.items():
        if key in caption:
            attributes["neckline"].append(value)

    for key, value in SILHOUETTE_RULES.items():
        if key in caption:
            attributes["silhouette"].append(value)

    return attributes

def extract_dominant_colors(caption: str):

    caption = caption.lower()

    colors = []

    for color in COLORS:
        if color in caption:
            colors.append(color)

    return list(dict.fromkeys(colors))
def analyze_fashion_image(image_path: str) -> dict:

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    processor, model, device = load_blip_model()

    image = Image.open(path).convert("RGB")

    prompts = [
        "Describe the clothing in detail.",
        "What top is the person wearing?",
        "What bottom is the person wearing?",
        "Describe the footwear.",
        "Describe the accessories.",
        "What colors are visible?",
        "What fashion style is this outfit?"
    ]

    captions = []

    for prompt in prompts:

        inputs = processor(
            images=image,
            text=prompt,
            return_tensors="pt",
        )

        inputs = {
            k: v.to(device)
            for k, v in inputs.items()
        }

        with torch.inference_mode():

            output = model.generate(
                **inputs,
                max_new_tokens=60,
            )

        answer = processor.decode(
            output[0],
            skip_special_tokens=True,
        )

        captions.append(answer)

    full_caption = ". ".join(captions)

    items = extract_fashion_items(full_caption)

    aesthetics = extract_aesthetics(full_caption)

    attributes = extract_attributes(full_caption)

    dominant_colors = extract_dominant_colors(full_caption)

    return {

        "model": MODEL_NAME,

        "device": str(device),

        "overall_description": full_caption,

        "overall_style": aesthetics,

        "dominant_colors": dominant_colors,

        "fashion_attributes": attributes,

        "items": items,
    }