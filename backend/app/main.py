from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import check_database_connection
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.capture import router as capture_router
from app.api.visual_search import router as visual_router
app = FastAPI(
    title="Myntra Fashion OS API",
    description="AI-powered universal fashion capture and life event planner",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(capture_router)
app.include_router(visual_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080",
                    "http://localhost:5174",
                    "http://localhost:5173",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {
        "message": "Myntra Fashion OS API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
@app.get("/health/database")
def database_health_check():
    is_connected = check_database_connection()

    if is_connected:
        return {
            "status": "healthy",
            "database": "MongoDB connected successfully"
        }

    return {
        "status": "unhealthy",
        "database": "MongoDB connection failed"
    }