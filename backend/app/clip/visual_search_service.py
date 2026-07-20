from PIL import Image

from app.clip.clip_service import clip_service
from app.clip.faiss_loader import faiss_loader


class VisualSearchService:

    def search(self, image: Image.Image, top_k: int = 5):

        # Generate CLIP embedding
        embedding = clip_service.encode_image(image)

        # Search FAISS
        scores, indices = faiss_loader.index.search(
            embedding,
            top_k
        )

        results = []

        for score, idx in zip(scores[0], indices[0]):

            product = faiss_loader.metadata[idx].copy()

            product["similarity_score"] = round(float(score), 4)

            results.append(product)

        return results


# Singleton
visual_search_service = VisualSearchService()