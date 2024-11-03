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
    servicetype: str
    extrafilters: Optional[str] = None
    demographic: Optional[str] = None
    website: Optional[str] = None
    summary: Optional[str] = None
    address: str
    coordinates: Dict[str, float]  
    neighborhoods: Optional[str] = None
    hours: Optional[str] = None
    phone: Optional[str] = None
    languages: Optional[str] = None
    googlelink: Optional[str] = None
    source: Optional[str] = None

    class Config:
        orm_mode = True

@app.get("/services", response_model=List[ServiceModel])
#fix it so that it can take multiple query parameters
async def get_combined_services(query: str, lat: float, lng: float, radius: int):
    #convert miles to meter
    radius = radius * 1609.34
    
    spreadsheet_services = fetch_and_process_spreadsheet_data(
        'UrbanRefugeAidServices', 
        'balmy-virtue-440518-c9-1dbeaecb35aa.json'
    )
    places_services = find_places(query, lat, lng, radius)
    combined_services = spreadsheet_services + places_services

    services_dict = [ServiceModel(**vars(service)) for service in combined_services]
    
    return services_dict

# to run the server, use the command:
# uvicorn server:app --reload


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