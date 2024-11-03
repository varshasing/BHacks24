from pydantic import BaseModel
from typing import List, Optional, Tuple

class ServiceModel(BaseModel):
    ID: str
    name: str
    servicetype: List[str]
    extrafilters: Optional[List[str]]
    demographic: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    address: List[str]
    coordinates: Optional[tuple] = None
    neighborhoods: Optional[str] = None
    hours: Optional[str] = None
    phone: Optional[str] = None
    languages: List[str]
    googlelink: Optional[str] = None
    source: Optional[str] = None

    class Config:
        orm_mode = True


class ReviewModel(BaseModel):
    service_id: str
    review: str

class ServiceReviewsModel(BaseModel):
    service_id: str
    reviews: List[str]