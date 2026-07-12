from pydantic import BaseModel, HttpUrl

class ImageURLRequest(BaseModel):
    url: HttpUrl
class VideoURLRequest(BaseModel):
    url: HttpUrl