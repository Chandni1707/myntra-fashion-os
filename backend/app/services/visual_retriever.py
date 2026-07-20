from typing import Dict
from PIL import Image

from app.clip.visual_search_service import visual_search_service


def retrieve_visual_candidates(
    image: Image.Image,
    top_k: int = 100,
) -> Dict[str, float]:
    results = visual_search_service.search(
        image=image,
        top_k=top_k,
    )

    return {
        str(result.get("product_id")): float(result.get("similarity_score", 0.0))
        for result in results
    }