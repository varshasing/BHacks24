from pydantic import BaseModel, validator
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

    @validator('ID', pre=True)
    def convert_id_to_string(cls, value):
        return str(value)

    @validator('name', pre=True)
    def convert_name_to_string(cls, value):
        return str(value)

    @validator('source', pre=True)
    def convert_source_to_string(cls, value):
        return str(value)

class ServiceInput(BaseModel):
    name: str 
    addr: str 
    hours: Optional[str] = None
    languages: Optional[List[str]] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    services: List[str] 
    coordinates: List[str] = None

    class Config:
        orm_mode = True

class ReviewModel(BaseModel):
    service_id: str
    review: str
    upvote: int

class ServiceReviewsModel(BaseModel):
    service_id: str
    reviews: List[str]
    upvote: int