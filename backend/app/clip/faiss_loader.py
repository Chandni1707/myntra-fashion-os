from pathlib import Path
import json
import faiss

# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = BASE_DIR / "data" / "clip"

INDEX_PATH = DATA_DIR / "visual_products.faiss"
METADATA_PATH = DATA_DIR / "metadata.json"


class FaissLoader:

    def __init__(self):

        print("Loading Visual FAISS Index...")

        self.index = faiss.read_index(str(INDEX_PATH))

        print(f"Loaded {self.index.ntotal} vectors")

        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            self.metadata = json.load(f)

        print(f"Loaded {len(self.metadata)} metadata records")


# Singleton
faiss_loader = FaissLoader()