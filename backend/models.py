from pydantic import BaseModel
from typing import List, Optional, Tuple

class ServiceModel(BaseModel):
    ID: str
    name: str
    servicetype: List[str]
    extrafilters: Optional[List[str]] = None
    demographic: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    address: str
    coordinates: List[Tuple[float, float]]  # List of lat/lng tuples
    neighborhoods: Optional[List[str]] = None
    hours: Optional[str] = None
    phone: Optional[str] = None
    languages: Optional[List[str]] = None
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