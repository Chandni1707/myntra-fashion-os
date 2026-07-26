from copy import deepcopy


def optimize_outfit_budget(outfit, total_budget):
    """
    Optimizes the complete outfit so that
    total cost never exceeds the user's budget.

    Priority:
    Main Outfit > Bottomwear > Footwear > Bag > Accessories
    """

    if not outfit:
        return outfit

    outfit = deepcopy(outfit)

    # -----------------------------
    # Current Total
    # -----------------------------

    total = 0

    for item in outfit:

        try:
            total += float(item.get("price", 0))
        except Exception:
            pass

    if total <= total_budget:
        return outfit

    # -----------------------------
    # Importance of each category
    # Higher = More Important
    # -----------------------------

    priority = {

        # Main Outfit
        "dress": 100,
        "lehenga": 100,
        "saree": 100,
        "kurta": 100,
        "kurta set": 100,
        "shirt": 100,
        "topwear": 100,
        "blazer": 100,
        "jacket": 100,

        # Bottomwear
        "bottomwear": 90,
        "trouser": 90,
        "jeans": 90,

        # Footwear
        "footwear": 80,
        "heels": 80,
        "sandals": 80,
        "boots": 80,
        "shoes": 80,
        "formal shoes": 80,
        "sneakers": 80,

        # Bags
        "bag": 70,
        "handbag": 70,
        "clutch": 70,

        # Accessories
        "watch": 60,
        "jewellery": 60,
        "earrings": 60,
        "necklace": 60,
        "bracelet": 60,
        "accessory": 60,
    }

    # -----------------------------
    # Sort by importance
    # -----------------------------

    def get_priority(product):

        category = str(
            product.get("category")
            or product.get("subcategory")
            or ""
        ).lower()

        return priority.get(category, 50)

    outfit.sort(
        key=get_priority,
        reverse=True,
    )

    # -----------------------------
    # Build optimized outfit
    # -----------------------------

    optimized = []
    running_total = 0

    for product in outfit:

        try:
            price = float(product.get("price", 0))
        except Exception:
            price = 0

        if running_total + price <= total_budget:

            optimized.append(product)
            running_total += price

    return optimized