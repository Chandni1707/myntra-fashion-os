from pydantic import BaseModel, EmailStr, Field
from typing import List


class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class StylePreferences(BaseModel):
    preferred_styles: List[str] = []
    preferred_colors: List[str] = []
    preferred_fit: str = "regular"
    default_budget: float = Field(default=3000, gt=0)
    preferred_gender: str | None = None