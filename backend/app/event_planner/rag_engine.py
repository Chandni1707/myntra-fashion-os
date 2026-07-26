import pickle
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).parent
INDEX_DIR = BASE_DIR / "faiss_index"

# Load MiniLM
model = SentenceTransformer("all-MiniLM-L6-v2")

# Load FAISS index
index = faiss.read_index(str(INDEX_DIR / "event.index"))

# Load metadata
with open(INDEX_DIR / "metadata.pkl", "rb") as f:
    documents = pickle.load(f)


def retrieve_context(query: str, top_k: int = 1):
    """
    Retrieve the most relevant knowledge documents.
    """

    embedding = model.encode(query).astype("float32")
    embedding = np.expand_dims(embedding, axis=0)

    distances, indices = index.search(embedding, top_k)

    results = []

    for idx in indices[0]:
        if idx != -1:
            results.append(documents[idx])

    return results


# ✅ Add this OUTSIDE the main block
def retrieve_text(query: str) -> str:
    """
    Returns the most relevant knowledge document as plain text.
    """

    results = retrieve_context(query, top_k=1)

    if not results:
        return ""

    return results[0]["content"]


if __name__ == "__main__":

    query = input("Enter Event: ")

    results = retrieve_context(query)

    print("\nRetrieved Documents\n")

    for i, doc in enumerate(results, 1):
        print("=" * 50)
        print(f"{i}. {doc['title']}")
        print("=" * 50)
        print(doc["content"])
        print()