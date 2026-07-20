from pydantic import BaseModel, Field, HttpUrl

class ImageURLRequest(BaseModel):
    url: HttpUrl
class VideoURLRequest(BaseModel):
    url: HttpUrl
class TransformPromptRequest(BaseModel):
    prompt: str = Field(
        min_length=3,
        max_length=500
    )    