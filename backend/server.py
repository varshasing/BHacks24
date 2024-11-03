from fastapi import FastAPI, HTTPException
from spreadsheet import fetch_and_process_spreadsheet_data, hash_organization_name
from map import find_places
from typing import List
from database import create_connection
import json
import ast
import math
from models import ServiceModel, ReviewModel, ServiceReviewsModel, ServiceInput


app = FastAPI()
is_firsttime = True

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


# Helper function to parse JSON fields from a database row
def parse_service_row(row: dict) -> ServiceModel:
    # Ensure coordinates are parsed as a tuple from string format
    if 'coordinates' in row:
        coordinates_str = row['coordinates']
        # Safely convert the string representation to a tuple
        coordinates = tuple(ast.literal_eval(coordinates_str))
    else:
        coordinates = ()

    service = ServiceModel(
        ID= str(row['id']),
        name=row['name'],
        coordinates=coordinates, 
        servicetype=json.loads(row["services"]) if row.get("services") else [],  
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
        source="User Input"
    )
    return service


# Endpoint for displaying user input data
@app.get("/locations/", response_model=List[ServiceModel])
async def get_all_services(lat: float, lng: float, radius: float):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services")  
    rows = cursor.fetchall()
    conn.close()

    # services = [parse_service_row(dict(zip([column[0] for column in cursor.description], row))) for row in rows]
    services = [
        parse_service_row(dict(zip([column[0] for column in cursor.description], row)))
        for row in rows
    ]

    # Filter services by distance
    filtered_services = [
        service for service in services
        if service.coordinates and len(service.coordinates) > 0 
        and calculate_distance(
            lat, 
            lng, 
            float(service.coordinates[0][0]), 
            float(service.coordinates[0][1])
        ) <= radius        
    ]
    
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
        ID=str(service_id),
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
        source="User Input"
    )

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        INSERT INTO services (ID, name, servicetype, extrafilters, demographic, website,
                              summary, address, coordinates, neighborhoods, hours, phone,
                              languages, googlelink, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            service.source
        )
    )
    conn.commit()
    conn.close()
    return {"message": "Service added successfully"}



# POST endpoint to add a new review for a service
@app.post("/reviews/")
async def add_review(review: ReviewModel):
    conn = create_connection()
    cursor = conn.cursor()

    # Check if the service ID exists
    cursor.execute("SELECT ID FROM services WHERE ID = ?", (review.service_id,))
    service = cursor.fetchone()
    if not service:
        conn.close()
        raise HTTPException(status_code=404, detail="Service ID not found")
        
    # Check if there are existing reviews for this service
    cursor.execute("SELECT reviews FROM reviews WHERE service_id = ?", (review.service_id,))
    row = cursor.fetchone()

    if row:
        # If reviews exist, append the new review to the list
        reviews = json.loads(row[0])
        reviews.append(review.review)
        cursor.execute("UPDATE reviews SET reviews = ? WHERE service_id = ?", (json.dumps(reviews), review.service_id))
    else:
        # If no reviews exist, create a new entry
        cursor.execute("INSERT INTO reviews (service_id, reviews) VALUES (?, ?)", (review.service_id, json.dumps([review.review])))

    conn.commit()
    conn.close()

    return {"message": "Review added successfully"}

# GET endpoint to retrieve all service IDs and their corresponding reviews
@app.get("/reviews/", response_model=List[ServiceReviewsModel])
async def get_all_reviews():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT service_id, reviews FROM reviews")
    rows = cursor.fetchall()
    conn.close()

    service_reviews = [
        ServiceReviewsModel(service_id=row[0], reviews=json.loads(row[1])) for row in rows
    ]
    return service_reviews


# right now only works for one service type. Food, Shelter doesn't work