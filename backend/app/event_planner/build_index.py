from pathlib import Path
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load MiniLM
model = SentenceTransformer("all-MiniLM-L6-v2")

BASE_DIR = Path(__file__).parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge"
INDEX_DIR = BASE_DIR / "faiss_index"

INDEX_DIR.mkdir(exist_ok=True)

documents = []
embeddings = []

# Read every markdown file
for file in KNOWLEDGE_DIR.glob("*.md"):
    text = file.read_text(encoding="utf-8")

    documents.append({
        "title": file.stem,
        "content": text
    })

    embedding = model.encode(text)
    embeddings.append(embedding)

embeddings = np.array(embeddings).astype("float32")

dimension = embeddings.shape[1]

index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

faiss.write_index(index, str(INDEX_DIR / "event.index"))

with open(INDEX_DIR / "metadata.pkl", "wb") as f:
    pickle.dump(documents, f)

print("=" * 40)
print(f"Indexed {len(documents)} knowledge documents.")
print("=" * 40)