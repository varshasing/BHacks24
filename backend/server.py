from fastapi import FastAPI, HTTPException
from spreadsheet import fetch_and_process_spreadsheet_data, hash_organization_name
from map import find_places
from typing import List
from database import create_connection, get_upvote_by_id, create_table
import json
from models import ServiceModel, ServiceInput, ReviewModel
from starlette.middleware.cors import CORSMiddleware
import ast
import math
from models import ServiceModel, ReviewModel, ServiceInput
from map import remove_duplicates


app = FastAPI()
# Allow CORS for all origins (not recommended for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)


@app.on_event("startup")
async def startup_event():
    create_table()

@app.get("/services", response_model=List[ServiceModel])
async def get_combined_services(query: str, lat: float, lng: float, radius: float):
    # Convert miles to meters
    radius_meters = radius * 1609.34

    # Fetch services from the database
    conn = create_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM services")
    db_rows = cursor.fetchall()

    db_services = [
        parse_service_row(dict(zip([column[0] for column in cursor.description], row)))
        for row in db_rows
    ]

    # Fetch services from the spreadsheet
    spreadsheet_services = fetch_and_process_spreadsheet_data(
        'UrbanRefugeAidServices',
        'balmy-virtue-440518-c9-1dbeaecb35aa.json',
        lat,
        lng,
        radius,
        query
    )

    # Fetch services from external API (if applicable)
    query_services = find_places(query, lat, lng, radius)  

    # Combine all services
    combined_services = db_services  + query_services + spreadsheet_services

    # Filter services based on location
    filtered_services = []
    for service in combined_services:
        if service.coordinates:
            print(type(service.coordinates))
            if isinstance(service.coordinates, list):
                service_lat = float(service.coordinates[0][0])
                service_lng = float(service.coordinates[0][1])
            elif isinstance(service.coordinates, tuple):
                service_lat = float(service.coordinates[0])
                service_lng = float(service.coordinates[1])
            distance = calculate_distance(lat, lng, service_lat, service_lng)

            # Check if within the radius
            if distance <= radius_meters:
                if query:
                    # Check if the service name matches any of the query strings
                    if any(q.lower() in service.name.lower() for q in query):
                        if isinstance(service.coordinates[0], str):
                            coordinatess = (float(service.coordinates[0]), float(service.coordinates[1]))
                            service.coordinates = coordinatess

                        filtered_services.append(service)
                else:
                    filtered_services.append(service)
        else:
            print(f"Service {service.name} has invalid coordinates: {service.coordinates}")

    conn.close()
    return filtered_services



# Helper function to parse JSON fields from a database row
def parse_service_row(row: dict) -> ServiceModel:
    coordinates_str = row.get('coordinates', '[]')
    if coordinates_str:
        try:
            coordinates_list = json.loads(coordinates_str) 
            if isinstance(coordinates_list, list):
                coordinates = (coordinates_list[0],  coordinates_list[1]) # Extract the tuple
            else:
                coordinates = coordinates_list
        except (json.JSONDecodeError, ValueError):
            coordinates = ()  # Fallback to empty tuple if parsing fails
    else:
        coordinates = ()  # Fallback if coordinates_str is empty
    print(f"Deserialized coordinates: {coordinates}")  # Debugging output
    
    
    services_str = row.get("servicetype", "[]")
    try:
        servicetype = json.loads(services_str)
        print(f"Deserialized servicetype: {servicetype}")  # Debugging output
    except json.JSONDecodeError as e:
        print(f"Error decoding services JSON: {e}")  # Error details
        servicetype = []


    service = ServiceModel(
        ID= str(row['ID']),
        name=row['name'],
        coordinates=coordinates, 
        servicetype=servicetype,  
        extrafilters=None, 
        demographic=None, 
        website=row["website"] if row.get("website") else None,
        summary=row["notes"] if row.get("notes") else None,
        address=[row["addr"]] if row.get("addr") else [],  
        neighborhoods=None, 
        hours=row["hours"] if row.get("hours") else None,
        phone=row["phone"] if row.get("phone") else None,
        languages=json.loads(row["languages"]) if row.get("languages") else [], 
        googlelink=None, 
        source="User Input",
        upvote=get_upvote_by_id(str(row['ID']))
    )
    return service


# Endpoint for displaying user input data
@app.get("/locations/", response_model=List[ServiceModel])
async def get_all_services(lat: float, lng: float, radius: float):
    radius = radius * 1609.34
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services")  
    rows = cursor.fetchall()
    conn.close()

    services = [
        parse_service_row(dict(zip([column[0] for column in cursor.description], row)))
        for row in rows
    ]

    filtered_services = []
    for service in services:
        if service.coordinates and len(service.coordinates) == 2:
            service_lat = float(service.coordinates[0])  
            service_lng = float(service.coordinates[1])  
            distance = calculate_distance(lat, lng, service_lat, service_lng)

            if distance <= radius:
                filtered_services.append(service)
        else:
            print(f"Service {service.name} has invalid coordinates: {service.coordinates}")

    return filtered_services

def calculate_distance(lat1, lon1, lat2, lon2):
    # Radius of the Earth in kilometers
    R = 6371.0
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c * 1000  # Return distance in meters


# Endpoint for users to input data
@app.post("/locations/")
async def add_service(service_input: ServiceInput):
    # Generate unique ID for the service
    service_id = hash(service_input.name)  # You can customize this ID generation

    # Validate that coordinates contain two valid floats
    try:
        coordinates = tuple(service_input.coordinates)  # Tuple of floats
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid coordinates format")

    # Create an instance of ServiceModel with the input data
    
    service = ServiceModel(
        ID= str(service_id),
        name=service_input.name,
        servicetype=service_input.services,  # Map 'services' to 'servicetype'
        extrafilters=None,  # Handle as needed
        address=[service_input.addr],  # Assuming addr is a single string; wrap it in a list
        coordinates=coordinates,  # Set coordinates
        neighborhoods=None,  # Handle as needed
        hours=service_input.hours,
        phone=service_input.phone,
        languages=service_input.languages,
        website=service_input.website,
        summary=service_input.notes,  # Assuming 'notes' maps to 'summary'
        demographic=None,  # Handle as needed
        googlelink=None,  # Handle as needed
        source="User Input",
        upvote = get_upvote_by_id(str(service_id))
    )


    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        INSERT INTO services (ID, name, servicetype, extrafilters, demographic, website,
                              summary, address, coordinates, neighborhoods, hours, phone,
                              languages, googlelink, source, upvote)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            service.ID,
            service.name,
            json.dumps(service.servicetype), 
            json.dumps(service.extrafilters) if service.extrafilters is not None else None,
            service.demographic,
            service.website,
            service.summary,
            json.dumps(service.address),  
            json.dumps(service.coordinates) if service.coordinates else None, 
            service.neighborhoods,
            service.hours,
            service.phone,
            json.dumps(service.languages), 
            service.googlelink,
            service.source,
            service.upvote
        )
    )
    conn.commit()
    cursor.execute("SELECT servicetype FROM services WHERE ID=?", (service.ID,))
    stored_servicetype = cursor.fetchone()
    if stored_servicetype:
        servicetype_list = json.loads(stored_servicetype[0])  # Deserialize JSON string
    print("Deserialized servicetype:", servicetype_list)  # Should print: ['Legal']

    conn.close()
    return {"message": "Service added successfully"}


@app.post("/reviews/")
async def add_review(review: ReviewModel):
    conn = create_connection()
    cursor = conn.cursor()
        
    # Check if there are existing entries for this service
    cursor.execute("SELECT upvote FROM reviews WHERE ID = ?", (review.ID,))
    row = cursor.fetchone()

    if row:
        # If the entry exists, increment the upvote count
        upvote_count = row[0] + 1
        cursor.execute(
            "UPDATE reviews SET upvote = ? WHERE ID = ?",
            (upvote_count, review.ID)
        )
    else:
        # If no entry exists, create a new one with upvote initialized to 1
        cursor.execute("INSERT INTO reviews (ID, upvote) VALUES (?, ?)", 
                       (review.ID, 1))

    conn.commit()
    conn.close()

    return {"message": "Upvote added successfully"}

@app.get("/reviews/{review_id}", response_model=ReviewModel)
async def get_review(review_id: str):
    conn = create_connection()
    cursor = conn.cursor()

    # Select ID and upvote from the reviews table for the specific ID
    cursor.execute("SELECT ID, upvote FROM reviews WHERE ID = ?", (review_id,))
    row = cursor.fetchone()
    conn.close()

    # If no review is found, raise a 404 error
    if row is None:
        review = ReviewModel(ID=review_id, upvote=0)

    # Create a ReviewModel instance with the retrieved data
    review = ReviewModel(ID=row[0], upvote=row[1])
    return review