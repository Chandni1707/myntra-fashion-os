from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status

from app.database import database
from app.schemas.user import StylePreferences
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/api/users",
    tags=["Users"]
)


@router.get("/me")
def get_my_profile(
    current_user=Depends(get_current_user)
):
    return {
        "id": str(current_user["_id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "preferences": current_user.get("preferences", {}),
        "onboarding_completed": current_user.get(
            "onboarding_completed",
            False
        )
    }


@router.put("/me/preferences", status_code=status.HTTP_200_OK)
def update_my_preferences(
    preferences: StylePreferences,
    current_user=Depends(get_current_user)
):
    updated_preferences = {
        "styles": preferences.preferred_styles,
        "colors": preferences.preferred_colors,
        "fit": preferences.preferred_fit,
        "default_budget": preferences.default_budget
    }

    database.users.update_one(
        {
            "_id": current_user["_id"]
        },
        {
            "$set": {
                "preferences": updated_preferences,
                "onboarding_completed": True,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    return {
        "message": "Style preferences updated successfully",
        "preferences": updated_preferences,
        "onboarding_completed": True
    }