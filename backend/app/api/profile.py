from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.database import database
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/profile")
def get_profile(current_user=Depends(get_current_user)):

    preferences = current_user.get("preferences", {})

    return {
        "name": current_user.get("name", ""),
        "email": current_user.get("email", ""),

        "looks_generated": current_user.get("looks_generated", 0),
        "favorites": current_user.get("favorites", 0),
        "style_score": current_user.get("style_score", 90),

        "favorite_colors": preferences.get("colors", []),
        "favorite_styles": preferences.get("styles", []),
        "favorite_brands": current_user.get("favorite_brands", []),

        "fit": preferences.get("fit", ""),
        "budget": preferences.get("default_budget", ""),
        "gender": current_user.get("gender", "")
    }


# 👇 ADD THIS BELOW THE GET /profile ENDPOINT

class ProfileUpdate(BaseModel):
    favorite_colors: list[str]
    favorite_styles: list[str]
    favorite_brands: list[str]
    fit: str
    budget: str
    gender: str


@router.put("/profile")
def update_profile(
    data: ProfileUpdate,
    current_user=Depends(get_current_user),
):

    database.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "preferences.colors": data.favorite_colors,
                "preferences.styles": data.favorite_styles,
                "preferences.fit": data.fit,
                "preferences.default_budget": data.budget,
                "favorite_brands": data.favorite_brands,
                "gender": data.gender,
            }
        },
    )

    return {"message": "Profile updated successfully"}