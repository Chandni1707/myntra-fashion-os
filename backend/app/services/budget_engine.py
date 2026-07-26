EVENT_BUDGET_SPLITS = {

    "wedding": {
        "main": 0.55,
        "footwear": 0.15,
        "bag": 0.15,
        "accessory": 0.15,
    },

    "reception": {
        "main": 0.60,
        "footwear": 0.15,
        "bag": 0.10,
        "accessory": 0.15,
    },

    "engagement": {
        "main": 0.55,
        "footwear": 0.15,
        "bag": 0.15,
        "accessory": 0.15,
    },

    "haldi": {
        "main": 0.65,
        "footwear": 0.20,
        "accessory": 0.15,
    },

    "mehendi": {
        "main": 0.60,
        "footwear": 0.20,
        "accessory": 0.20,
    },

    "farewell": {
        "main": 0.60,
        "footwear": 0.20,
        "bag": 0.10,
        "accessory": 0.10,
    },

    "interview": {
        "main": 0.70,
        "footwear": 0.20,
        "accessory": 0.10,
    },

    "diwali": {
        "main": 0.60,
        "footwear": 0.20,
        "accessory": 0.20,
    },

    "christmas": {
        "main": 0.60,
        "footwear": 0.20,
        "bag": 0.10,
        "accessory": 0.10,
    },

    "birthday": {
        "main": 0.60,
        "footwear": 0.20,
        "bag": 0.10,
        "accessory": 0.10,
    }

}


def allocate_budget(
    event: str,
    gender: str,
    total_budget: float,
):

    event = event.lower().strip()

    if event not in EVENT_BUDGET_SPLITS:
        event = "birthday"

    split = EVENT_BUDGET_SPLITS[event]

    allocation = {}

    for category, ratio in split.items():
        allocation[category] = round(
            total_budget * ratio,
            2,
        )

    return allocation