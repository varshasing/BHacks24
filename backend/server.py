from fastapi import FastAPI, HTTPException, Query
from typing import Optional
from map import get_place_details, find_places, get_coordinates  # Assuming your functions are in `map.py`

app = FastAPI()

# Endpoint to get place details by place_id
@app.get("/place_details/{place_id}")
async def place_details(place_id: str):
    data = get_place_details(place_id)
    if not data:
        raise HTTPException(status_code=404, detail="Place not found")
    return data

# Endpoint to find places based on a search query, location, and radius
@app.get("/find_places")
async def find_places_endpoint(
    query: str,
    lat: float = Query(..., description="Latitude of the location"),
    lng: float = Query(..., description="Longitude of the location"),
    radius: int = Query(500, description="Search radius in meters")
):
    data = find_places(query, lat, lng, radius)
    if not data:
        raise HTTPException(status_code=404, detail="No places found")
    return data

# Endpoint to get coordinates based on an address
@app.get("/coordinates")
async def coordinates(location: str):
    coordinates = get_coordinates(location)
    if not coordinates:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"latitude": coordinates[0], "longitude": coordinates[1]}
