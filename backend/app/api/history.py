from datetime import datetime
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.database import database
from app.utils.auth import get_current_user

router = APIRouter(prefix="/history", tags=["History"])


class HistoryCreate(BaseModel):
    event_name: str
    event_date: str
    total_price: float
    match_score: int
    recommendations: list


@router.post("/")
def save_history(
    data: HistoryCreate,
    current_user=Depends(get_current_user),
):
    doc = {
        "user_id": str(current_user["_id"]),
        "event_name": data.event_name,
        "event_date": data.event_date,
        "total_price": data.total_price,
        "match_score": data.match_score,
        "recommendations": data.recommendations,
        "created_at": datetime.utcnow()
    }

    result = database.history.insert_one(doc)

    doc["_id"] = str(result.inserted_id)

    return doc


@router.get("/")
def get_history(
    current_user=Depends(get_current_user),
):
    items = list(
        database.history.find(
            {"user_id": str(current_user["_id"])}
        ).sort("created_at", -1)
    )

    for item in items:
        item["_id"] = str(item["_id"])

    return items


@router.delete("/{history_id}")
def delete_history(
    history_id: str,
    current_user=Depends(get_current_user),
):
    result = database.history.delete_one(
        {
            "_id": ObjectId(history_id),
            "user_id": str(current_user["_id"])
        }
    )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="History not found"
        )

    return {"message": "Deleted"}