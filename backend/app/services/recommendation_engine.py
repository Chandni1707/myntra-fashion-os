import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Set
from app.services.semantic_retriever import (
    search_semantic_products_by_category,
)


# =========================================================
# Catalogue path
# =========================================================

CATALOGUE_PATH = (
    Path(__file__).resolve().parent.parent
    / "data"
    / "product_catalog_5000.json"
)


# =========================================================
# Category aliases
# Used to map words from prompts/BLIP into catalogue categories
# =========================================================

CATEGORY_ALIASES = {
    "top": {
        "top",
        "shirt",
        "t-shirt",
        "tshirt",
        "blouse",
        "kurta",
        "kurti",
        "sweater",
        "hoodie",
    },
    "bottom": {
        "bottom",
        "jeans",
        "trousers",
        "pants",
        "shorts",
        "skirt",
        "palazzo",
        "leggings",
    },
    "dress": {
        "dress",
        "gown",
        "jumpsuit",
    },
    "outerwear": {
        "outerwear",
        "jacket",
        "blazer",
        "coat",
        "cardigan",
    },
    "footwear": {
        "footwear",
        "shoes",
        "sneakers",
        "heels",
        "sandals",
        "loafers",
        "boots",
        "flats",
    },
    "bag": {
        "bag",
        "handbag",
        "shoulder bag",
        "backpack",
        "clutch",
    },
    "accessory": {
        "accessory",
        "earrings",
        "necklace",
        "bracelet",
        "watch",
        "belt",
        "sunglasses",
        "scarf",
        "jewellery",
        "jewelry",
    },
}
# =========================================================
# Catalogue-aware style and occasion mappings
# =========================================================

STYLE_MATCH_MAP = {
    "indo-western": {
        "exact": ["ethnic"],
        "fallback": ["partywear", "formal"],
    },
    "streetwear": {
        "exact": ["streetwear"],
        "fallback": ["casual"],
    },
    "minimalist": {
        "exact": ["minimalist"],
        "fallback": ["casual", "formal"],
    },
    "old-money": {
        "exact": ["formal", "minimalist"],
        "fallback": ["partywear"],
    },
    "y2k": {
        "exact": ["streetwear"],
        "fallback": ["casual", "partywear"],
    },
    "formal": {
        "exact": ["formal"],
        "fallback": ["minimalist"],
    },
    "casual": {
        "exact": ["casual"],
        "fallback": ["minimalist", "streetwear"],
    },
    "elegant": {
        "exact": ["partywear", "formal"],
        "fallback": ["minimalist", "ethnic"],
    },
    "athleisure": {
        "exact": ["casual"],
        "fallback": ["streetwear"],
    },
}


OCCASION_MATCH_MAP = {
    "college_farewell": {
        "exact": ["farewell"],
        "fallback": ["party", "wedding", "festival"],
    },
    "wedding": {
        "exact": ["wedding"],
        "fallback": ["festival", "party"],
    },
    "interview": {
        "exact": ["interview"],
        "fallback": ["business", "office"],
    },
    "festival": {
        "exact": ["festival"],
        "fallback": ["wedding", "party"],
    },
    "concert": {
        "exact": ["concert"],
        "fallback": ["party", "casual"],pip show huggingface-hub
    },
    "date": {
        "exact": ["date"],
        "fallback": ["party", "casual"],
    },
    "college": {
        "exact": ["college"],
        "fallback": ["casual"],
    },
    "office": {
        "exact": ["office", "business"],
        "fallback": ["interview"],
    },
    "party": {
        "exact": ["party"],
        "fallback": ["concert", "farewell"],
    },
}
# =========================================================
# Fashion Formality Knowledge
# =========================================================

STYLE_FORMALITY = {
    "formal": 5,
    "professional": 5,
    "business": 5,

    "minimalist": 4,

    "smart-casual": 3,
    "partywear": 3,
    "ethnic": 3,

    "casual": 2,
    "athleisure": 2,

    "streetwear": 1,
}

OCCASION_FORMALITY = {
    "interview": 5,
    "office": 5,
    "business": 5,

    "wedding": 5,

    "festival": 3,
    "party": 3,
    "date": 3,

    "college": 2,
    "concert": 2,
    "travel": 2,
    "everyday": 2,

    "gym": 1,
}


# =========================================================
# Basic helpers
# =========================================================

def normalize_text(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip().lower()


def normalize_list(values: Any) -> List[str]:
    if not values:
        return []

    if isinstance(values, str):
        return [normalize_text(values)]

    if isinstance(values, list):
        return [
            normalize_text(value)
            for value in values
            if value is not None
        ]

    return []


def safe_price(product: Dict[str, Any]) -> float:
    try:
        return float(product.get("price", 0))
    except (TypeError, ValueError):
        return 0.0


def get_product_id(product: Dict[str, Any]) -> str:
    return str(
        product.get("product_id")
        or product.get("id")
        or ""
    )


# =========================================================
# Load product catalogue
# =========================================================

def load_products() -> List[Dict[str, Any]]:
    if not CATALOGUE_PATH.exists():
        raise FileNotFoundError(
            f"Product catalogue not found at: {CATALOGUE_PATH}"
        )

    with open(
        CATALOGUE_PATH,
        "r",
        encoding="utf-8",
    ) as file:
        products = json.load(file)

    if not isinstance(products, list):
        raise ValueError(
            "Product catalogue must contain a JSON list."
        )

    return products


# =========================================================
# Category mapping
# =========================================================

def map_item_to_category(item_name: str) -> Optional[str]:
    item_name = normalize_text(item_name)

    if not item_name:
        return None

    for category, aliases in CATEGORY_ALIASES.items():
        for alias in aliases:
            if alias in item_name:
                return category

    return None


# =========================================================
# Extract information from BLIP analysis
# =========================================================

def get_detected_items(
    analysis: Optional[Dict[str, Any]]
) -> List[Dict[str, Any]]:

    if not analysis:
        return []

    items = analysis.get("items", [])

    if not isinstance(items, list):
        return []

    return items


def get_detected_colors(
    analysis: Optional[Dict[str, Any]]
) -> List[str]:

    colors = []

    for item in get_detected_items(analysis):
        color = normalize_text(item.get("color"))

        if color and color not in colors:
            colors.append(color)

    return colors


def get_detected_subcategories(
    analysis: Optional[Dict[str, Any]]
) -> List[str]:

    subcategories = []

    for item in get_detected_items(analysis):
        subcategory = normalize_text(
            item.get("subcategory")
        )

        if (
            subcategory
            and subcategory not in subcategories
        ):
            subcategories.append(subcategory)

    return subcategories


def get_detected_categories(
    analysis: Optional[Dict[str, Any]]
) -> List[str]:

    categories = []

    for item in get_detected_items(analysis):
        category = normalize_text(
            item.get("category")
        )

        mapped_category = (
            map_item_to_category(category)
            or category
        )

        if (
            mapped_category
            and mapped_category not in categories
        ):
            categories.append(mapped_category)

    return categories


# =========================================================
# Prompt helpers
# =========================================================

def get_actions(
    parsed_intent: Optional[Dict[str, Any]]
) -> List[str]:

    if not parsed_intent:
        return []

    return normalize_list(
        parsed_intent.get("actions", [])
    )


def get_preserve_categories(
    parsed_intent: Optional[Dict[str, Any]]
) -> Set[str]:

    if not parsed_intent:
        return set()

    preserve_items = normalize_list(
        parsed_intent.get("preserve_items", [])
    )

    categories = set()

    for item in preserve_items:
        category = map_item_to_category(item)

        if category:
            categories.add(category)

    return categories


def get_replace_categories(
    parsed_intent: Optional[Dict[str, Any]]
) -> Set[str]:

    if not parsed_intent:
        return set()

    replace_items = normalize_list(
        parsed_intent.get("replace_items", [])
    )

    categories = set()

    for item in replace_items:
        category = map_item_to_category(item)

        if category:
            categories.add(category)

    return categories


# =========================================================
# Gender filtering
# =========================================================

def filter_products_by_gender(
    products: List[Dict[str, Any]],
    user_preferences: Optional[Dict[str, Any]],
    analysis=None,
) -> List[Dict[str, Any]]:

    if not user_preferences:
        return products

    preferred_gender = normalize_text(
        user_preferences.get("gender")
        or user_preferences.get("preferred_gender")
    )
    if not preferred_gender and analysis:
        preferred_gender = normalize_text(
            analysis.get("detected_gender")
        )

    if not preferred_gender or preferred_gender == "all":
        return products

    filtered = [
        product
        for product in products
        if normalize_text(product.get("gender"))
        in {preferred_gender, "unisex"}
    ]

    return filtered or products




# =========================================================
# Product scoring
# =========================================================

def score_product(
    product: Dict[str, Any],
    parsed_intent: Optional[Dict[str, Any]],
    user_preferences: Optional[Dict[str, Any]],
    analysis: Optional[Dict[str, Any]],
    visual_scores: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:
    """Hybrid score where semantic similarity is primary intelligence.

    Metadata, inspiration and preferences only support the semantic signal;
    there are no event-to-garment or event-to-style rules here.
    """
    parsed_intent = parsed_intent or {}
    user_preferences = user_preferences or {}
    visual_scores = visual_scores or {}
    score = 0.0
    reasons: List[str] = []

    semantic_score = float(product.get("semantic_score", 0.0) or 0.0)
    visual_score = visual_scores.get(
        get_product_id(product),
        0.0,
    )

    if visual_score > 0:
        score += visual_score * 250.0
        reasons.append(
            "Visually similar to your inspiration"
        )
    if semantic_score > 0:
        score += semantic_score * 100.0
        reasons.append("Semantically relevant to your fashion request")

    product_styles = set(normalize_list(product.get("styles", [])))
    product_occasions = set(normalize_list(product.get("occasions", [])))
    product_colors = set(normalize_list(product.get("colors", [])))
    target_style = normalize_text(parsed_intent.get("target_style"))
    occasion = normalize_text(parsed_intent.get("occasion"))

    # Soft exact metadata evidence only. No Dussehra -> ethnic, interview -> formal, etc.
    if target_style and target_style in product_styles:
        score += 12.0
        reasons.append("Matches the requested style metadata")
    if occasion and occasion in product_occasions:
        score += 10.0
        reasons.append("Matches the requested occasion metadata")

    preferred_styles = set(normalize_list(
        user_preferences.get("preferred_styles", user_preferences.get("styles", []))
    ))
    preferred_colors = set(normalize_list(
        user_preferences.get("preferred_colors", user_preferences.get("colors", []))
    ))
    if preferred_styles & product_styles:
        score += 8.0
        reasons.append("Matches your personal style")
    if preferred_colors & product_colors:
        score += 6.0
        reasons.append("Matches your preferred colors")

    actions = get_actions(parsed_intent)
    product_subcategory = normalize_text(product.get("subcategory"))
    product_category = normalize_text(product.get("category"))
    detected_subcategories = set(get_detected_subcategories(analysis))
    detected_categories = set(get_detected_categories(analysis))
    detected_colors = set(get_detected_colors(analysis))
    # -----------------------------------------------------
    # Intent-aware visual scoring
    # -----------------------------------------------------

    # 1. RECREATE LOOK
    # User wants almost the same outfit
    if "recreate_look" in actions:
        if (
            product_subcategory
            and product_subcategory in detected_subcategories
        ):
            score += 60
            reasons.append(
                "Same clothing type as your inspiration"
            )

        elif (
            product_category
            and product_category in detected_categories
        ):
            score += 25
            reasons.append(
                "Matches your inspiration category"
            )

        if product_colors & detected_colors:
            score += 12
            reasons.append(
                "Keeps similar colors"
            )

    # -----------------------------------------------------
    # COMPLETE LOOK
    # Recommend only missing items
    # -----------------------------------------------------

    elif "complete_look" in actions:

        if (
            product_category
            not in detected_categories
        ):
            score += 18
            reasons.append(
                "Completes your outfit"
            )

        if product_colors & detected_colors:
            score += 8
            reasons.append(
                "Matches your outfit colors"
            )

    # -----------------------------------------------------
    # TRANSFORM STYLE
    # Allow changing style but keep outfit related
    # -----------------------------------------------------

    elif "transform_style" in actions:

        if (
            product_category
            and product_category in detected_categories
        ):
            score += 18
            reasons.append(
                "Suitable replacement"
            )

        if target_style and target_style in product_styles:
            score += 20
            reasons.append(
                "Matches requested style"
            )


    # -----------------------------------------------------
    # REPLACE ITEM
    # Keep all other categories
    # -----------------------------------------------------

    elif get_replace_categories(parsed_intent):

        replace_categories = get_replace_categories(
            parsed_intent
        )

        if product_category in replace_categories:

            score += 30

            reasons.append(
                "Replacement for requested item"
            )


    # -----------------------------------------------------
    # DEFAULT
    # General recommendation
    # -----------------------------------------------------

    else:

        if (
            product_category
            and product_category in detected_categories
        ):
            score += 10

        if (
            product_colors
            and product_colors & detected_colors
        ):
            score += 5

    return {
        **product,
        "semantic_score": round(semantic_score, 4),
        "recommendation_score": round(score, 2),
        "match_reasons": reasons,
    }


# =========================================================
# Score entire catalogue
# =========================================================

def score_catalogue(
    products: List[Dict[str, Any]],
    parsed_intent: Optional[Dict[str, Any]],
    user_preferences: Optional[Dict[str, Any]],
    analysis: Optional[Dict[str, Any]],
    visual_scores: Optional[Dict[str, float]] = None,
) -> List[Dict[str, Any]]:

    scored_products = [
        score_product(
            product=product,
            parsed_intent=parsed_intent,
            user_preferences=user_preferences,
            analysis=analysis,
            visual_scores=visual_scores,
        )
        for product in products
    ]

    return sorted(
        scored_products,
        key=lambda product: (
            product.get(
                "recommendation_score",
                0,
            ),
            -safe_price(product),
        ),
        reverse=True,
    )


# =========================================================
# Select best product
# =========================================================
# =========================================================
# Explicit request relevance filter
# =========================================================

def is_relevant_to_explicit_request(
    product: Dict[str, Any],
    parsed_intent: Optional[Dict[str, Any]],
) -> bool:
    """Backward-compatible soft relevance hook.

    Semantic retrieval already decides candidate relevance. We deliberately do
    not reject products through rigid occasion/style mappings.
    """
    return True


# =========================================================
# Color harmony and optional skin-tone personalization
# =========================================================

NEUTRAL_COLORS = {
    "black", "white", "grey", "gray", "beige", "cream", "ivory",
    "navy", "brown", "tan", "khaki", "off-white", "silver", "gold",
}

COLOR_FAMILIES = {
    "red": "warm", "orange": "warm", "yellow": "warm", "mustard": "warm",
    "peach": "warm", "coral": "warm", "maroon": "warm", "burgundy": "warm",
    "blue": "cool", "navy": "cool", "purple": "cool", "lavender": "cool",
    "green": "cool", "teal": "cool", "pink": "cool",
}

UNDERTONE_PREFERENCES = {
    "warm": {"cream", "ivory", "beige", "brown", "tan", "mustard", "olive", "coral", "peach", "gold", "red"},
    "cool": {"white", "black", "grey", "gray", "navy", "blue", "purple", "lavender", "pink", "silver", "burgundy"},
    "neutral": NEUTRAL_COLORS | {"blue", "green", "red", "pink", "olive"},
}

def color_harmony_score(
    product: Dict[str, Any],
    selected_items: List[Dict[str, Any]],
    user_preferences: Optional[Dict[str, Any]] = None,
) -> float:
    """Return a soft compatibility bonus; never hard-filter a color."""
    colors = set(normalize_list(product.get("colors", [])))
    if not colors:
        return 0.0

    score = 0.0
    existing_colors = set()
    for item in selected_items:
        existing_colors.update(normalize_list(item.get("colors", [])))

    if existing_colors:
        if colors & existing_colors:
            score += 5.0
        if (colors & NEUTRAL_COLORS) or (existing_colors & NEUTRAL_COLORS):
            score += 6.0
        product_families = {COLOR_FAMILIES.get(c) for c in colors if COLOR_FAMILIES.get(c)}
        existing_families = {COLOR_FAMILIES.get(c) for c in existing_colors if COLOR_FAMILIES.get(c)}
        if product_families & existing_families:
            score += 3.0

    prefs = user_preferences or {}
    undertone = normalize_text(prefs.get("undertone"))
    # Skin tone is intentionally not used as a restrictive rule. Undertone only
    # provides a small optional bonus when the user explicitly supplies it.
    if undertone in UNDERTONE_PREFERENCES and colors & UNDERTONE_PREFERENCES[undertone]:
        score += 3.0

    return score


def select_best_product(
    scored_products: List[Dict[str, Any]],
    category: str,
    parsed_intent: Optional[Dict[str, Any]] = None,
    remaining_budget: Optional[float] = None,
    excluded_ids: Optional[Set[str]] = None,
    selected_items: Optional[List[Dict[str, Any]]] = None,
    user_preferences: Optional[Dict[str, Any]] = None,
) -> Optional[Dict[str, Any]]:
    excluded_ids = excluded_ids or set()
    selected_items = selected_items or []
    candidates = []
    for product in scored_products:
        if normalize_text(product.get("category")) != category:
            continue
        if get_product_id(product) in excluded_ids:
            continue
        price = safe_price(product)
        if price <= 0:
            continue
        if remaining_budget is not None and price > remaining_budget:
            continue
        candidate = product.copy()
        # Give a small bonus to products that are visually similar
        visual_bonus = float(candidate.get("semantic_score", 0))
        candidate["final_selection_score"] = (
            candidate.get("recommendation_score", 0)
            + visual_bonus * 20
        )
        formality = formality_score(
            candidate,
            parsed_intent,
        )
        compatibility, compatibility_reasons = outfit_compatibility_score(
            candidate,
            selected_items,
        )
        harmony = color_harmony_score(candidate, selected_items, user_preferences)
        candidate["formality_score"] = round(formality, 2)
        candidate["compatibility_score"] = round(compatibility, 2)
        candidate["color_harmony_score"] = round(harmony, 2)
        candidate["final_selection_score"] = round(
            float(candidate.get("recommendation_score", 0.0))
            + harmony
            + formality
            + compatibility,
            2,
        )
        if formality > 0:
            candidate.setdefault("match_reasons", []).append(
                "Matches the expected level of formality"
            )

        if harmony > 0 and selected_items:
            candidate.setdefault("match_reasons", []).append(
                "Coordinates with the selected outfit colors"
            )
        candidate.setdefault("match_reasons", []).extend(compatibility_reasons)
        candidates.append(candidate)
    if not candidates:
        return None
    return max(candidates, key=lambda p: (p.get("final_selection_score", 0), -safe_price(p)))
def formality_score(
    product: Dict[str, Any],
    parsed_intent: Optional[Dict[str, Any]],
) -> float:
    """
    Gives a soft bonus when the product's style matches
    the expected level of formality for the requested occasion.
    """

    parsed_intent = parsed_intent or {}

    occasion = normalize_text(parsed_intent.get("occasion"))

    if occasion not in OCCASION_FORMALITY:
        return 0.0

    expected = OCCASION_FORMALITY[occasion]

    styles = normalize_list(product.get("styles", []))

    if not styles:
        return 0.0

    level = max(
        (
            STYLE_FORMALITY.get(style, 2)
            for style in styles
        ),
        default=2,
    )

    diff = abs(level - expected)

    if diff == 0:
        return 10.0

    if diff == 1:
        return 6.0

    if diff == 2:
        return 3.0

    return 0.0
def outfit_compatibility_score(
    candidate: Dict[str, Any],
    selected_items: List[Dict[str, Any]],
) -> tuple[float, List[str]]:
    """
    Scores how well the candidate fits with the outfit selected so far.
    """

    if not selected_items:
        return 0.0, []

    score = 0.0
    reasons = []

    candidate_styles = set(normalize_list(candidate.get("styles")))
    candidate_occasions = set(normalize_list(candidate.get("occasions")))
    candidate_fit = normalize_text(candidate.get("fit"))

    selected_styles = set()
    selected_occasions = set()
    selected_brands = set()
    selected_fits = set()

    for item in selected_items:
        selected_styles.update(normalize_list(item.get("styles")))
        selected_occasions.update(normalize_list(item.get("occasions")))

        brand = normalize_text(item.get("brand"))
        if brand:
            selected_brands.add(brand)

        fit = normalize_text(item.get("fit"))
        if fit:
            selected_fits.add(fit)

    # Style consistency
    if candidate_styles & selected_styles:
        score += 5
        reasons.append("Complements the outfit style")

    # Occasion consistency
    if candidate_occasions & selected_occasions:
        score += 4
        reasons.append("Suitable for the same occasion")

    # Fit consistency
    if candidate_fit and candidate_fit in selected_fits:
        score += 2
        reasons.append("Maintains a consistent fit")

    # Small brand bonus
    candidate_brand = normalize_text(candidate.get("brand"))
    if candidate_brand and candidate_brand in selected_brands:
        score += 1
        reasons.append("Matches the outfit brand")

    return score, reasons
# =========================================================
# Determine which categories should be recommended
# =========================================================

def determine_required_categories(
    parsed_intent: Optional[Dict[str, Any]],
    analysis: Optional[Dict[str, Any]],
) -> List[str]:

    parsed_intent = parsed_intent or {}

    actions = get_actions(parsed_intent)

    detected_categories = set(
        get_detected_categories(analysis)
    )

    preserve_categories = get_preserve_categories(
        parsed_intent
    )

    replace_categories = get_replace_categories(
        parsed_intent
    )

    # -----------------------------------------------------
    # Recreate look
    # Find products corresponding to detected categories
    # -----------------------------------------------------

    if "recreate_look" in actions:

        categories = list(detected_categories)

        if not categories:
            return [
                "top",
                "bottom",
                "footwear",
                "accessory",
            ]

        return categories

    # -----------------------------------------------------
    # Complete look
    # Only recommend missing categories
    # -----------------------------------------------------

    if "complete_look" in actions:

        if "dress" in detected_categories:
            complete_categories = [
                "footwear",
                "accessory",
            ]

        else:
            complete_categories = [
                "top",
                "bottom",
                "footwear",
                "accessory",
            ]

        required = [
            category
            for category in complete_categories
            if (
                category not in detected_categories
                or category in replace_categories
            )
        ]

        return required

    # -----------------------------------------------------
    # Preserve / replace instructions
    # -----------------------------------------------------

    if preserve_categories or replace_categories:

        standard_categories = [
            "top",
            "bottom",
            "footwear",
            "accessory",
        ]

        required = [
            category
            for category in standard_categories
            if category not in preserve_categories
        ]

        return required

    # -----------------------------------------------------
    # Style transformation
    # Recommend a fresh complete outfit
    # -----------------------------------------------------

    if "transform_style" in actions:

        return [
            "top",
            "bottom",
            "footwear",
            "accessory",
        ]

    # -----------------------------------------------------
    # Default
    # -----------------------------------------------------

    return [
        "top",
        "bottom",
        "footwear",
        "accessory",
    ]


# =========================================================
# Generate explanation
# =========================================================

def generate_outfit_explanation(
    parsed_intent: Optional[Dict[str, Any]],
    selected_items: List[Dict[str, Any]],
) -> str:

    parsed_intent = parsed_intent or {}

    target_style = normalize_text(
        parsed_intent.get("target_style")
    )

    occasion = normalize_text(
        parsed_intent.get("occasion")
    )

    parts = []

    if target_style:
        parts.append(
            f"a {target_style.replace('-', ' ')} aesthetic"
        )

    if occasion:
        parts.append(
            f"your {occasion.replace('_', ' ')}"
        )

    if not selected_items:
        return (
            "We couldn't find enough matching products "
            "for this request."
        )

    if parts:
        context = " and ".join(parts)

        return (
            f"This outfit was selected to match {context}, "
            "while considering your inspiration, personal "
            "preferences, and budget."
        )

    return (
        "This outfit was selected using your uploaded "
        "inspiration and personal style preferences."
    )


# =========================================================
# Main recommendation function
# =========================================================

def recommend_outfit(
    parsed_intent: Optional[Dict[str, Any]],
    user_preferences: Optional[Dict[str, Any]],
    analysis: Optional[Dict[str, Any]],
    visual_scores: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:

    parsed_intent = parsed_intent or {}
    user_preferences = user_preferences or {}
    analysis = analysis or {}
    visual_scores = visual_scores or {}

    # Load catalogue
    products = load_products()

    total_catalogue_size = len(products)

    # Apply optional gender filtering
    products = filter_products_by_gender(
        products=products,
        user_preferences=user_preferences,
        analysis=analysis,
    )

    gender_filtered_count = len(products)

    # Retrieve semantically relevant candidates
    required_categories = determine_required_categories(
        parsed_intent=parsed_intent,
        analysis=analysis,
    )

    semantic_candidates = (
        search_semantic_products_by_category(
            parsed_intent=parsed_intent,
            categories=required_categories,
            user_preferences=user_preferences,
            image_analysis=analysis,
            gender=user_preferences.get("gender"),
            max_price=parsed_intent.get("budget_max"),
            top_k_each=40,
        )
    )
    # Apply gender filtering to semantic retrieval results
    semantic_candidates = filter_products_by_gender(
        products=semantic_candidates,
        user_preferences=user_preferences,
        analysis=analysis,
    )
    






    # Safe fallback:
    # If semantic retrieval unexpectedly returns no products,
    # continue with the gender-filtered catalogue.
    if semantic_candidates:
        products_for_scoring = semantic_candidates
    else:
        products_for_scoring = products

    # Score retrieved candidates using hybrid ranking
    scored_products = score_catalogue(
        products=products_for_scoring,
        parsed_intent=parsed_intent,
        user_preferences=user_preferences,
        analysis=analysis,
        visual_scores=visual_scores,
    )

    # Read budget
    budget_max = (
        parsed_intent.get("budget_max")
        or user_preferences.get("default_budget")
    )

    if budget_max is not None:
        try:
            budget_max = float(budget_max)
        except (TypeError, ValueError):
            budget_max = None

    # Determine categories according to user intent

    # For a plain recommendation request, let semantic ranking choose between
    # a one-piece outfit path and a separates path. No occasion is mapped to
    # any garment type.
    actions = get_actions(parsed_intent)
    if not actions and not get_preserve_categories(parsed_intent) and not get_replace_categories(parsed_intent):
        best_dress = next((p for p in scored_products if normalize_text(p.get("category")) == "dress"), None)
        best_top = next((p for p in scored_products if normalize_text(p.get("category")) == "top"), None)
        best_bottom = next((p for p in scored_products if normalize_text(p.get("category")) == "bottom"), None)
        dress_score = float(best_dress.get("recommendation_score", 0)) if best_dress else -1
        separates_scores = [float(p.get("recommendation_score", 0)) for p in (best_top, best_bottom) if p]
        separates_score = sum(separates_scores) / len(separates_scores) if separates_scores else -1
        if dress_score >= separates_score:
            required_categories = ["dress", "footwear", "accessory"]

    selected_items = []
    selected_ids = set()
    total_price = 0.0

    for category in required_categories:

        remaining_budget = None

        if budget_max is not None:
            remaining_budget = (
                budget_max - total_price
            )

        product = select_best_product(
            scored_products=scored_products,
            category=category,
            parsed_intent=parsed_intent,
            remaining_budget=remaining_budget,
            excluded_ids=selected_ids,
            selected_items=selected_items,
            user_preferences=user_preferences,
        )

        if not product:
            continue

        selected_items.append(product)

        selected_ids.add(
            get_product_id(product)
        )

        total_price += safe_price(product)

    explanation = generate_outfit_explanation(
        parsed_intent=parsed_intent,
        selected_items=selected_items,
    )

    return {
        "original_prompt": parsed_intent.get(
            "original_prompt"
        ),
        "actions": get_actions(parsed_intent),
        "target_style": parsed_intent.get(
            "target_style"
        ),
        "occasion": parsed_intent.get(
            "occasion"
        ),
        "required_categories": required_categories,
        "preserve_items": parsed_intent.get(
            "preserve_items",
            [],
        ),
        "replace_items": parsed_intent.get(
            "replace_items",
            [],
        ),
        "items": selected_items,
        "total_price": round(total_price, 2),
        "budget_max": budget_max,
        "within_budget": (
            total_price <= budget_max
            if budget_max is not None
            else True
        ),
        "explanation": explanation,
        "catalogue_size": total_catalogue_size,
        "products_considered": len(products_for_scoring),
    }


# Backward-compatible alias
def recommend_complete_outfit(
    parsed_intent: Optional[Dict[str, Any]],
    user_preferences: Optional[Dict[str, Any]],
    analysis: Optional[Dict[str, Any]],
    visual_scores: Optional[Dict[str, float]] = None,
) -> Dict[str, Any]:

    return recommend_outfit(
        parsed_intent=parsed_intent,
        user_preferences=user_preferences,
        analysis=analysis,
        visual_scores=visual_scores,
    )