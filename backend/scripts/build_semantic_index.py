import json
import sys
from pathlib import Path

import faiss
import numpy as np




# =========================================================
# Make backend/app imports work when running this script
# =========================================================

BACKEND_DIR = Path(__file__).resolve().parents[1]

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


from app.services.semantic_retriever import (
    get_semantic_model,
    product_to_semantic_text,
)


# =========================================================
# Paths
# =========================================================
APP_DATA_DIR = BACKEND_DIR / "app" / "data"

CATALOGUE_PATH = APP_DATA_DIR / "product_catalog_5000.json"

SEMANTIC_INDEX_DIR = APP_DATA_DIR / "semantic_index"

FAISS_INDEX_PATH = (
    SEMANTIC_INDEX_DIR / "products.faiss"
)

METADATA_PATH = (
    SEMANTIC_INDEX_DIR / "product_metadata.json"
)


# =========================================================
# Load product catalogue
# =========================================================

def load_products():

    if not CATALOGUE_PATH.exists():
        raise FileNotFoundError(
            f"Product catalogue not found at: "
            f"{CATALOGUE_PATH}"
        )

    with open(
        CATALOGUE_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        data = json.load(file)

    # Supports either:
    #
    # [
    #   {...},
    #   {...}
    # ]
    #
    # OR:
    #
    # {
    #   "products": [
    #       {...},
    #       {...}
    #   ]
    # }

    if isinstance(data, list):
        products = data

    elif (
        isinstance(data, dict)
        and isinstance(data.get("products"), list)
    ):
        products = data["products"]

    else:
        raise ValueError(
            "Unsupported product catalogue format. "
            "Expected a list of products or "
            "{'products': [...]}"
        )

    return products


# =========================================================
# Build semantic index
# =========================================================

def build_semantic_index():

    print("=" * 60)
    print("Fashion OS — Building Semantic Product Index")
    print("=" * 60)

    products = load_products()

    if not products:
        raise ValueError(
            "Product catalogue is empty."
        )

    print(
        f"\nLoaded {len(products)} products."
    )

    # ---------------------------------------------
    # Convert products into rich semantic text
    # ---------------------------------------------

    product_texts = [
        product_to_semantic_text(product)
        for product in products
    ]

    print(
        f"Created {len(product_texts)} "
        f"semantic product descriptions."
    )

    # ---------------------------------------------
    # Load MiniLM
    # ---------------------------------------------

    print("\nLoading MiniLM model...")

    model = get_semantic_model()

    # ---------------------------------------------
    # Generate embeddings
    # ---------------------------------------------

    print(
        "\nGenerating semantic embeddings..."
    )

    embeddings = model.encode(
        product_texts,
        batch_size=32,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    embeddings = np.asarray(
        embeddings,
        dtype="float32",
    )

    print(
        f"\nEmbedding shape: {embeddings.shape}"
    )

    # ---------------------------------------------
    # Build FAISS cosine-similarity index
    # ---------------------------------------------

    embedding_dimension = embeddings.shape[1]

    index = faiss.IndexFlatIP(
        embedding_dimension
    )

    index.add(embeddings)

    print(
        f"Products added to FAISS index: "
        f"{index.ntotal}"
    )

    # ---------------------------------------------
    # Create output directory
    # ---------------------------------------------

    SEMANTIC_INDEX_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # ---------------------------------------------
    # Save FAISS index
    # ---------------------------------------------

    faiss.write_index(
        index,
        str(FAISS_INDEX_PATH),
    )

    print(
        f"\nFAISS index saved to:\n"
        f"{FAISS_INDEX_PATH}"
    )

    # ---------------------------------------------
    # Save metadata in exact FAISS order
    # ---------------------------------------------

    metadata = []

    for index_position, product in enumerate(products):

        metadata.append(
    {
        "faiss_index": index_position,
        "product_id": product.get("product_id"),
        "name": product.get("name"),
        "category": product.get("category"),
        "subcategory": product.get("subcategory"),
        "gender": product.get("gender"),
        "price": product.get("price"),
        "colors": product.get("colors", []),
        "styles": product.get("styles", []),
        "fit": product.get("fit"),
        "occasions": product.get("occasions", []),
        "brand": product.get("brand"),
        "delivery_days": product.get("delivery_days"),
        "image_url": product.get("image_url"),
    }
)

    with open(
        METADATA_PATH,
        "w",
        encoding="utf-8",
    ) as file:
        json.dump(
            metadata,
            file,
            indent=2,
            ensure_ascii=False,
        )

    print(
        f"\nMetadata saved to:\n"
        f"{METADATA_PATH}"
    )

    print("\n" + "=" * 60)
    print(
        "Semantic product index built successfully!"
    )
    print("=" * 60)


# =========================================================
# Run
# =========================================================

if __name__ == "__main__":
    build_semantic_index()