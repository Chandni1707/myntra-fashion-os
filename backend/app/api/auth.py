from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext

from app.database import database
from app.schemas.user import UserRegister, UserLogin
from app.utils.auth import create_access_token


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegister):

    existing_user = database.users.find_one({
        "email": user.email.lower()
    })

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists"
        )

    hashed_password = password_context.hash(user.password)

    user_document = {
        "name": user.name.strip(),
        "email": user.email.lower(),
        "hashed_password": hashed_password,

        "preferences": {
            "styles": [],
            "colors": [],
            "fit": None,
            "default_budget": None
        },

        "onboarding_completed": False,

        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }

    result = database.users.insert_one(user_document)

    return {
        "message": "User registered successfully",
        "user": {
            "id": str(result.inserted_id),
            "name": user_document["name"],
            "email": user_document["email"],
            "onboarding_completed": False
        }
    }

@router.post("/login")
def login_user(credentials: UserLogin):

    user = database.users.find_one({
        "email": credentials.email.lower()
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    password_valid = password_context.verify(
        credentials.password,
        user["hashed_password"]
    )

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        user_id=str(user["_id"])
    )

    return {
        "message": "Login successful",

        "access_token": access_token,

        "token_type": "bearer",

        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "onboarding_completed": user.get(
                "onboarding_completed",
                False
            )
        }
    }
