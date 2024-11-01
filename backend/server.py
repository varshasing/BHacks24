from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from spreadsheet.service import Service
from spreadsheet.spreadsheet import parse_spreadsheet

from map import find_places

# FastAPI instance
app = FastAPI()

# Pydantic model for request/response validation
class ServiceRequest(BaseModel):
    query: str
    lat: float
    lng: float
    radius: int

# Endpoint to parse spreadsheet and return list of Service objects
@app.post("/get_spreadsheet", response_model=List[Service])
async def get_spreadsheet(file_path: str):  # Replace with your file handling logic
    try:
        services = parse_spreadsheet(file_path)
        return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to find places and return list of Service objects
@app.post("/find_places", response_model=List[Service])
async def get_googlemap(service_request: ServiceRequest):
    try:
        services = find_places(service_request.query, service_request.lat, service_request.lng, service_request.radius)
        return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Combined endpoint to get both lists of Service objects
@app.post("/combined_services", response_model=List[Service])
async def combined_services(service_request: ServiceRequest, file_path: str):
    try:
        # Get services from spreadsheet
        spreadsheet_services = await parse_spreadsheet(file_path)
        
        # Get services from find_places
        places_services = await find_places(service_request)

        # Combine the two lists
        combined_services = spreadsheet_services + places_services
        
        return combined_services
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# t run the server, use the command:
# uvicorn server:app --reload
