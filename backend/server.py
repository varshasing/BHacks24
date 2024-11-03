from fastapi import FastAPI
from fastapi.responses import JSONResponse
from service import Service
from spreadsheet import fetch_and_process_spreadsheet_data
from map import find_places
from pydantic import BaseModel
from typing import List, Optional, Dict


# FastAPI instance
app = FastAPI()

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

@app.get("/services", response_model=List[ServiceModel])
#fix it so that it can take multiple query parameters
async def get_combined_services(query: str, lat: float, lng: float, radius: float):
    # Convert miles to meters
    radius = radius * 1609.34

    spreadsheet_services = fetch_and_process_spreadsheet_data(
        'UrbanRefugeAidServices', 
        'balmy-virtue-440518-c9-1dbeaecb35aa.json',
        lat,
        lng,
        radius,
        query
    )
    places_services = find_places(query, lat, lng, radius)
    combined_services = spreadsheet_services + places_services

    services_dict = [
        ServiceModel(
            servicetype=[service.servicetype] if isinstance(service.servicetype, str) else service.servicetype,
            extrafilters=service.extrafilters.split(', ') if isinstance(service.extrafilters, str) else (service.extrafilters or []),
            languages=[service.languages] if isinstance(service.languages, str) else (service.languages or []),
            googlelink=str(service.googlelink) if isinstance(service.googlelink, bool) else service.googlelink,
            **{k: v for k, v in vars(service).items() if k not in {'servicetype', 'extrafilters', 'languages', 'googlelink'}}
        )
        for service in combined_services
    ]
    
    return services_dict

# to run the server, use the command:
#uvicorn server:app --reload


'''
TODO:
sienna:
database for users to enter their own location
json string, name, address, all the fields of the spreadsheet
some may be empty string
make a database table. each key is a number counting in sequence (or someting that is a unique key)


one pushed into database should be on the map immediate, must get all poitns from spreadsheet, google maps, and databse
SQLite
only need one table
'''