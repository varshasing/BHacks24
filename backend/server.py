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
async def get_combined_services(query: str, lat: float, lng: float, radius: int):
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

varsha:
we want when we call the fastAPI, to only return things from the spreadsheet that match the query
    spreadsheet parser needs to be able to filter by query
we need a filter for this appended list. need to make sure there are no duplicates

why are somethings NULL instead of ""


when the front end passes back the query, lat, lng, radius, the google maps API follows that fuideline
BUT the spreadsheet parser does not follow that guideline, so we need to filter out shit that is too far
'''