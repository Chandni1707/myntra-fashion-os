from typing import List



from app.services.semantic_retriever import search_semantic_products
from app.services.budget_engine import allocate_budget
from app.services.budget_optimizer import optimize_outfit_budget
from app.event_planner.rag_engine import retrieve_text
from app.services.intent_expander import expand_fashion_intent


# ==========================================================
# Outfit Categories (Priority Order)
# ==========================================================

OUTFIT_CATEGORIES = [
    "dress",
    "topwear",
    "bottomwear",
    "footwear",
    "bag",
    "jewellery",
    "watch",
]


# ==========================================================
# Category Priority
# Used while selecting the best outfit
# ==========================================================

CATEGORY_PRIORITY = {
    "dress": 100,
    "lehenga": 100,
    "saree": 100,
    "anarkali": 100,
    "kurta": 100,
    "kurta set": 100,
    "shirt": 100,
    "topwear": 100,
    "blazer": 100,
    "jacket": 100,

    "bottomwear": 90,
    "jeans": 90,
    "trouser": 90,
    "leggings": 90,
    "palazzo": 90,

    "footwear": 80,
    "heels": 80,
    "sandals": 80,
    "boots": 80,
    "shoes": 80,
    "formal shoes": 80,
    "sneakers": 80,

    "bag": 70,
    "handbag": 70,
    "clutch": 70,

    "watch": 60,
    "jewellery": 60,
    "earrings": 60,
    "necklace": 60,
    "bracelet": 60,
}


# ==========================================================
# Outfit Engine
# ==========================================================

class OutfitEngine:

    @staticmethod
    def normalize_gender(gender: str) -> str:

        gender = gender.lower().strip()

        female = [
            "female",
            "girl",
            "woman",
            "women",
            "lady",
        ]

        if gender in female:
            return "female"

        return "male"

    @staticmethod
    def generate_complete_outfit(request):
        print("\n\n########## OUTFIT ENGINE STARTED ##########\n\n")

        # ---------------------------------------
        # Normalize Input
        # ---------------------------------------

        event = request.event_type.strip()

        gender = request.gender.lower().strip()

        if gender in [
            "female",
            "girl",
            "woman",
            "women",
            "lady",
        ]:
            gender = "female"
        else:
            gender = "male"

        # ---------------------------------------
        # RAG Context
        # ---------------------------------------

        rag_context = retrieve_text(event)

        # ---------------------------------------
        # Intent Expansion
        # ---------------------------------------

        expanded_query = expand_fashion_intent(
            event,
            rag_context=rag_context,
        )

        if request.style:
            expanded_query += f"\nPreferred Style: {request.style}"

        if request.notes:
            expanded_query += f"\nAdditional Notes: {request.notes}"

        print("\n==============================")
        print("EVENT:", event)
        print("==============================")

        print(expanded_query)

        # ---------------------------------------
        # Budget Allocation
        # ---------------------------------------

        budget_split = allocate_budget(
            event=event,
            gender=gender,
            total_budget=request.budget,
        )

        categories = [
            "dress",
            "topwear",
            "bottomwear",
            "footwear",
            "bag",
            "jewellery",
        ]

        outfit = []

        used_products = set()

        # ==========================================================
        # Retrieve Candidate Products
        # ==========================================================

        candidate_products = search_semantic_products(
            query=expanded_query,
            gender=gender,
            top_k=60,
        )

        if not candidate_products:
            return []

        # ==========================================================
        # Build Outfit from Retrieved Products
        # ==========================================================

        for category in categories:

            if category in ["dress", "topwear"]:

                max_price = budget_split.get(
                    "main",
                    request.budget,
                )

            elif category == "bottomwear":

                max_price = budget_split.get(
                    "bottomwear",
                    request.budget,
                )

            elif category == "footwear":

                max_price = budget_split.get(
                    "footwear",
                    request.budget,
                )

            elif category == "bag":

                max_price = budget_split.get(
                    "bag",
                    request.budget,
                )

            else:

                max_price = budget_split.get(
                    "accessory",
                    request.budget,
                )

            products = search_semantic_products(

                query=f"{expanded_query} {category}",

                gender=gender,

                category=category,

                max_price=max_price,

                top_k=10,
            )

            print(
                f"{category} -> {len(products)} products"
            )

            if not products:
                continue

            selected = None
            alternatives = []

            for product in products:

                if product["product_id"] in used_products:
                    continue

                product["final_score"] = product.get(
                    "semantic_score",
                    0,
                )

                if selected is None:
                    selected = product
                    used_products.add(product["product_id"])
                else:
                    alternatives.append(product)

                if len(alternatives) == 4:
                    break

            if selected:

                selected["alternatives"] = alternatives

                outfit.append(selected)

        # ==========================================================  
        # Optimize Outfit Budget
        # ==========================================================
        outfit = optimize_outfit_budget(outfit, request.budget)
        # ==========================================================
        # Fallback if No Outfit Found
        # ==========================================================

        if not outfit:

            fallback_products = search_semantic_products(
                query=expanded_query,
                gender=gender,
                max_price=request.budget,
                top_k=5,
            )

            if fallback_products:
                outfit.append(fallback_products[0])

        # ==========================================================
        # Sort Outfit by Category Priority
        # ==========================================================

        def get_priority(product):

            category = str(
                product.get("category")
                or product.get("subcategory")
                or ""
            ).lower()

            return CATEGORY_PRIORITY.get(category, 0)

        outfit.sort(
            key=get_priority,
            reverse=True,
        )

        return outfit
