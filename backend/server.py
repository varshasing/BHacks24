from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from service import Service
from spreadsheet import fetch_and_process_spreadsheet_data
from map import find_places
from typing import List, Optional, Dict
from database import create_connection
import json
from models import ServiceModel, ReviewModel, ServiceReviewsModel

app = FastAPI()

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


#Helper function to parse JSON fields
def parse_service_row(row):
    return ServiceModel(
        ID=str(row[0]),
        name=row[1],
        servicetype=json.loads(row[2]) if row[2] else [],
        extrafilters=json.loads(row[3]) if row[3] else [],
        demographic=row[4],
        website=row[5],
        summary=row[6],
        address=row[7],
        coordinates=json.loads(row[8]) if row[8] else [],
        neighborhoods=json.loads(row[9]) if row[9] else [],
        hours=row[10],
        phone=row[11],
        languages=json.loads(row[12]) if row[12] else [],
        googlelink=row[13],
        source=row[14]
    )

# Endpoint to retrieve all service data
@app.get("/locations/", response_model=List[ServiceModel])
async def get_all_services():
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM services")
    rows = cursor.fetchall()
    conn.close()

    services = [parse_service_row(row) for row in rows]
    return services

# Endpoint for users to input data
@app.post("/locations/")
async def add_service(service: ServiceModel):
    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''
        INSERT INTO services (name, servicetype, extrafilters, demographic, website,
                              summary, address, coordinates, neighborhoods, hours, phone,
                              languages, googlelink, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (
            service.name,
            json.dumps(service.servicetype),
            json.dumps(service.extrafilters) if service.extrafilters else None,
            service.demographic,
            service.website,
            service.summary,
            service.address,
            json.dumps(service.coordinates),
            json.dumps(service.neighborhoods) if service.neighborhoods else None,
            service.hours,
            service.phone,
            json.dumps(service.languages) if service.languages else None,
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
    cursor.execute("SELECT id FROM services WHERE id = ?", (review.service_id,))
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
