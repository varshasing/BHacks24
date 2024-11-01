from fastapi import FastAPI
from fastapi.responses import JSONResponse
from typing import List
from spreadsheet.service import Service
from spreadsheet.spreadsheet import parse_spreadsheet
from map import find_places


# FastAPI instance
app = FastAPI()

@app.get("/allservices", response_model=List[Service])
async def get_combined_services(query: str, lat: float, lng: float, radius: int):
    spreadsheet_services = parse_spreadsheet()
    places_services = find_places(query, lat, lng, radius)

    combined_services = spreadsheet_services + places_services

    # Convert the list of Service objects to a list of dictionaries
    services_dict = [service.__dict__ for service in combined_services]
    
    return JSONResponse(content=services_dict)

# to run the server, use the command:
# uvicorn server:app --reload

'''
TODO:
place all backend files tgt so we don't have absolute paths
combine the requirements file
combine API keys into one file  
make sure parsed_spreadsheet is the correct function
test the server'''