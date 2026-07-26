from pathlib import Path
from typing import Any, Dict, List, Optional
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from app.event_planner.rag_engine import retrieve_text

from threading import Lock
_model = None
_model_lock = Lock()
_metadata = None
from app.services.intent_expander import expand_fashion_intent

# =========================================================
# Paths
# =========================================================

BACKEND_DIR = Path(__file__).resolve().parents[2]

APP_DATA_DIR = BACKEND_DIR / "app" / "data"

SEMANTIC_INDEX_DIR = (
    APP_DATA_DIR
    / "semantic_index"
)

FAISS_INDEX_PATH = (
    SEMANTIC_INDEX_DIR
    / "products.faiss"
)
METADATA_PATH = (
    SEMANTIC_INDEX_DIR
    / "product_metadata.json"
)

# =========================================================
# Model configuration
# =========================================================

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


# =========================================================
# Lazy-loaded global resources
# =========================================================

_model: Optional[SentenceTransformer] = None
_index = None


# =========================================================
# Load MiniLM model
# =========================================================

def get_semantic_model() -> SentenceTransformer:
    global _model

    if _model is None:
        with _model_lock:
            if _model is None:
                print(f"Loading semantic model: {MODEL_NAME}")
                _model = SentenceTransformer(MODEL_NAME)
                print("Semantic model loaded successfully.")

    return _model


# =========================================================
# Convert product to semantic text
# =========================================================

def product_to_semantic_text(
    product: Dict[str, Any],
) -> str:

    name = product.get("name", "")
    category = product.get("category", "")
    subcategory = product.get("subcategory", "")
    gender = product.get("gender", "")

    colors = product.get("colors", [])
    styles = product.get("styles", [])
    occasions = product.get("occasions", [])

    fit = product.get("fit") or ""
    brand = product.get("brand", "")

    colors_text = ", ".join(colors)
    styles_text = ", ".join(styles)
    occasions_text = ", ".join(occasions)

    semantic_text = f"""
    Product: {name}.
    Brand: {brand}.
    Gender: {gender}.
    Category: {category}.
    Subcategory: {subcategory}.
    Colors: {colors_text}.
    Styles: {styles_text}.
    Fit: {fit}.
    Suitable occasions: {occasions_text}.
    """

    return " ".join(semantic_text.split())


# =========================================================
# Build semantic query from Fashion OS context
# =========================================================

def build_semantic_query(
    parsed_intent: Dict[str, Any],
    user_preferences: Optional[Dict[str, Any]] = None,
    image_analysis: Optional[Dict[str, Any]] = None,
) -> str:

    user_preferences = user_preferences or {}
    image_analysis = image_analysis or {}

    original_prompt = parsed_intent.get(
        "original_prompt",
        "",
    )

    target_style = parsed_intent.get(
        "target_style",
        "",
    )

    occasion = parsed_intent.get(
        "occasion",
        "",
    )

    actions = parsed_intent.get(
        "actions",
        [],
    )

    preferred_styles = user_preferences.get(
        "styles",
        [],
    )

    preferred_colors = user_preferences.get(
        "colors",
        [],
    )

    preferred_fit = user_preferences.get(
        "fit",
        "",
    )

    overall_description = image_analysis.get(
        "overall_description",
        "",
    )
    expanded_intent = ""

    try:
        rag_context = ""

        # Use RAG only for calendar/event requests
        if parsed_intent.get("event_mode", False):
            rag_context = retrieve_text(original_prompt)

        if original_prompt:
            expanded_intent = expand_fashion_intent(
                original_prompt,
                rag_context=rag_context,
            )

    except Exception as e:
        print(f"Intent expansion failed: {e}")

    actions_text = ", ".join(actions)
    preferred_styles_text = ", ".join(preferred_styles)
    preferred_colors_text = ", ".join(preferred_colors)

    query_lines = [
        f"User fashion request: {original_prompt}.",
        f"Requested target style: {target_style}.",
        f"Occasion: {occasion}.",
        f"Requested actions: {actions_text}.",
        f"User preferred styles: {preferred_styles_text}.",
        f"User preferred colors: {preferred_colors_text}.",
        f"User preferred fit: {preferred_fit}.",
        f"Original fashion inspiration: {overall_description}.",
        "",
        "Expanded fashion understanding:",
        f"{expanded_intent}",
    ]

    query = "\n".join(query_lines)
    print("\n========== SEMANTIC QUERY ==========")
    print(query)
    print("===================================\n")

    return " ".join(query.split())

# =========================================================
# Build category-aware semantic query
# =========================================================

def build_category_semantic_query(
    parsed_intent: Dict[str, Any],
    category: str,
    user_preferences: Optional[Dict[str, Any]] = None,
    image_analysis: Optional[Dict[str, Any]] = None,
) -> str:

    base_query = build_semantic_query(
        parsed_intent=parsed_intent,
        user_preferences=user_preferences,
        image_analysis=image_analysis,
    )

    category_prompts = {
        "top":
            "Find the best top, shirt, blouse, kurta or upper garment.",
        "bottom":
            "Find the best trousers, jeans, pants, skirt or lower garment.",
        "dress":
            "Find the best dress, jumpsuit, gown, saree or one-piece outfit.",
        "footwear":
            "Find matching shoes, heels, sandals, sneakers or loafers.",
        "accessory":
            "Find matching accessories like bags, earrings, watches, jewellery or belts.",
    }

    return (
        base_query
        + " "
        + category_prompts.get(category, "")
    )
# =========================================================
# Generate normalized embedding
# =========================================================

def encode_text(text: str) -> np.ndarray:

    model = get_semantic_model()

    embedding = model.encode(
        [text],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    return embedding.astype("float32")


# =========================================================
# Load FAISS index
# =========================================================

def get_semantic_index():

    global _index

    if _index is None:

        if not FAISS_INDEX_PATH.exists():
            raise FileNotFoundError(
                "Semantic FAISS index not found. "
                "Run build_semantic_index.py first."
            )

        print(
            f"Loading semantic FAISS index from: "
            f"{FAISS_INDEX_PATH}"
        )

        _index = faiss.read_index(
            str(FAISS_INDEX_PATH)
        )

        print(
            f"Semantic FAISS index loaded. "
            f"Products indexed: {_index.ntotal}"
        )

    return _index
# =========================================================
# Load product metadata
# =========================================================

def get_product_metadata() -> List[Dict[str, Any]]:
    global _metadata

    if _metadata is None:

        if not METADATA_PATH.exists():
            raise FileNotFoundError(
                "Semantic product metadata not found. "
                "Run build_semantic_index.py first."
            )

        with open(
            METADATA_PATH,
            "r",
            encoding="utf-8",
        ) as file:
            _metadata = json.load(file)

        print(
            f"Semantic product metadata loaded. "
            f"Products: {len(_metadata)}"
        )

    return _metadata


# =========================================================
# Search semantically relevant products
# =========================================================
CATEGORY_MAP = {
    "topwear": [
        "top",
        "shirt",
        "t-shirt",
        "kurti",
        "blouse"
    ],

    "bottomwear": [
        "bottom",
        "jeans",
        "pants",
        "trousers",
        "leggings",
        "palazzo"
    ],

    "dress": [
        "dress",
        "kurti",
        "lehenga",
        "saree",
        "anarkali"
    ],

    "footwear": [
        "footwear",
        "heels",
        "sandals",
        "flats",
        "shoes"
    ],

    "bag": [
        "bag",
        "handbag",
        "backpack",
        "clutch"
    ],

    "jewellery": [
        "jewellery",
        "earrings",
        "necklace",
        "ring",
        "bracelet"
    ]
}

def search_semantic_products(
    query: str,
    top_k: int = 20,
    gender: Optional[str] = None,
    category: Optional[str] = None,
    max_price: Optional[float] = None,
    min_score: Optional[float] = None,
) -> List[Dict[str, Any]]:

    if not query or not query.strip():
        return []

    index = get_semantic_index()
    metadata = get_product_metadata()

    query_embedding = encode_text(query)

    # Search a broader pool first because filtering happens afterwards.
    # Our catalogue currently has only 500 products, so searching the
    # complete index is perfectly acceptable for the MVP.
    search_k = index.ntotal

    scores, indices = index.search(
        query_embedding,
        search_k,
    )

    results = []

    for score, faiss_index in zip(
        scores[0],
        indices[0],
    ):
        if faiss_index < 0:
            continue

        product_metadata = metadata[
            int(faiss_index)
        ].copy()

        occasions = [
            o.lower()
            for o in product_metadata.get("occasions", [])
        ]

        styles = [
            s.lower()
            for s in product_metadata.get("styles", [])
        ]

        subcategory = str(
            product_metadata.get("subcategory", "")
        ).lower()

        category_name = str(
            product_metadata.get("category", "")
        ).lower()

        query_lower = query.lower()

        semantic_score = float(score)

        # -----------------------------
        # Style Boost
        # -----------------------------
        final_score = semantic_score

        for style in styles:
            if style in query_lower:
                final_score += 0.10

        # -----------------------------
        # Beach Vacation penalties
        # -----------------------------
        if "beach" in query_lower:

            if subcategory == "jeans":
                final_score -= 0.20

            if "formal" in styles:
                final_score -= 0.20

            if subcategory == "shirt":
                final_score -= 0.10

        # -----------------------------------------
        # Minimum semantic score filter
        # -----------------------------------------

        if (
            min_score is not None
            and semantic_score < min_score
        ):
            continue

        # -----------------------------------------
        # Gender filter
        # -----------------------------------------

        if gender is not None:
            product_gender = str(
                product_metadata.get("gender", "")
            ).lower()

            if gender.lower() == "female":
                valid = ["women", "woman", "female", "girls", "girl", "ladies"]

            elif gender.lower() == "male":
                valid = ["men", "man", "male", "boys", "boy"]

            else:
                valid = [gender.lower()]

            if not any(v in product_gender for v in valid):
                continue

        # -----------------------------------------
        # Category filter
        # -----------------------------------------
        if category is not None:
            product_category = str(
                product_metadata.get("category", "")
            ).lower()

            product_subcategory = str(
                product_metadata.get("subcategory", "")
            ).lower()

            valid_categories = CATEGORY_MAP.get(
                category.lower(),
                [category.lower()]
            )

            if not any(
                item == product_category or item == product_subcategory
                for item in valid_categories
            ):
                continue

        # -----------------------------------------
        # Maximum price filter
        # -----------------------------------------
        if max_price is not None:
            product_price = product_metadata.get("price")

            if product_price is not None:
                try:
                    if float(product_price) > float(max_price):
                        continue
                except (TypeError, ValueError):
                    pass

        # -----------------------------------------
        # Add semantic score
        # -----------------------------------------

        product_metadata["semantic_score"] = round(
            final_score,
            4,
        )

        results.append(product_metadata)

        if len(results) >= top_k:
            break

    print("=" * 60)
    print("QUERY:", query)
    print("CATEGORY:", category)
    print("RESULTS FOUND:", len(results))

    for p in results[:5]:
        print(
            p["name"],
            "|",
            p.get("category"),
            "|",
            p.get("gender"),
            "|",
            p.get("semantic_score"),
        )

    print("=" * 60)

    results.sort(
        key=lambda x: x["semantic_score"],
        reverse=True,
    )

    return results
# =========================================================
# Retrieve semantic candidates category-wise
# =========================================================

def search_semantic_products_by_category(
    parsed_intent: Dict[str, Any],
    categories: List[str],
    user_preferences: Optional[Dict[str, Any]] = None,
    image_analysis: Optional[Dict[str, Any]] = None,
    gender: Optional[str] = None,
    max_price: Optional[float] = None,
    top_k_each: int = 40,
) -> List[Dict[str, Any]]:

    all_results = []

    seen = set()

    for category in categories:

        query = build_category_semantic_query(
            parsed_intent=parsed_intent,
            category=category,
            user_preferences=user_preferences,
            image_analysis=image_analysis,
        )

        results = search_semantic_products(
            query=query,
            category=category,
            gender=gender,
            max_price=max_price,
            top_k=top_k_each,
        )

        for product in results:

            pid = product["product_id"]

            if pid in seen:
                continue

            seen.add(pid)

            all_results.append(product)

    return all_results