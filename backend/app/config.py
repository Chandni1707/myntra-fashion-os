import os
from dotenv import load_dotenv


load_dotenv()


class Settings:
    MONGODB_URL = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017"
    )

    DATABASE_NAME = os.getenv(
        "DATABASE_NAME",
        "myntra_fashion_os"
    )

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "change-this-secret-key"
    )

    ALGORITHM = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


settings = Settings()