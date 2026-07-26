from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.services.outfit_engine import OutfitEngine

router = APIRouter()


class EventRequest(BaseModel):
    event_type: str
    event_date: str
    location: str
    budget: float
    gender: str
    style: Optional[str] = ""
    notes: Optional[str] = ""


@router.post("/event-planner")
def event_planner(request: EventRequest):

    # -----------------------------
    # Normalize Gender
    # -----------------------------

    gender = request.gender.lower().strip()

    if gender in [
        "female",
        "girl",
        "woman",
        "women",
        "lady",
    ]:
        request.gender = "female"

    elif gender in [
        "male",
        "man",
        "boy",
        "men",
        "gentleman",
    ]:
        request.gender = "male"

    else:
        request.gender = gender

    # -----------------------------
    # Generate Outfit
    # -----------------------------

    outfit = OutfitEngine.generate_complete_outfit(request)

    recommendations = []

    total_price = 0

    for item in outfit:

        try:
            price = float(item.get("price", 0))
        except:
            price = 0

        total_price += price

        recommendations.append({

            "product_id": item.get("product_id"),

            "category": (
                item.get("category")
                or item.get("subcategory")
                or "Fashion"
            ),

            "title": item.get(
                "name",
                "Fashion Product",
            ),

            "brand": item.get(
                "brand",
                "",
            ),

            "price": price,

            "delivery_days": item.get(
                "delivery_days",
                "-",
            ),

            "image": item.get(
                "image",
                item.get("image_url", ""),
            ),

            "description": item.get(
                "description",
                "",
            ),

            "score": round(
                item.get("final_score", 0),
                2,
            ),

            "alternatives": item.get("alternatives", []),
        })

    return {

        "event": request.event_type,

        "location": request.location,

        "budget": request.budget,

        "total_price": round(total_price, 2),

        "remaining_budget": round(
            request.budget - total_price,
            2,
        ),

        "recommendations": recommendations,
    }