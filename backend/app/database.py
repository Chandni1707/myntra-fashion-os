from pymongo import MongoClient
from app.config import settings



client = MongoClient(
    settings.MONGODB_URL,
    serverSelectionTimeoutMS=5000
)

database = client[settings.DATABASE_NAME]


def get_database():
    return database


def check_database_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception as error:
        print(f"MongoDB connection error: {error}")
        return False