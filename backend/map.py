import requests
import json
from service import Service


# A dictionary with these keys: Education, Legal, Housing/Shelter, Healthcare, Food, Employment, Community Education, Cash Assistance, Mental Health Services, Case Management
query_dict = {
    "Education": ["immigrant education services", "ESL classes"],
    "Legal": ["immigration law", "citizenship services", "evaluations for asylum cases"],
    "Housing/Shelter": ["housing services", "homeless shelter", "housing assistance"],
    "Healthcare": ["healthcare services"],
    "Food": ["food bank"],
    "Employment": ["career counseling for immigrants"],
    "Community Education": ["community education"],
    "Cash Assistance": ["cash assistance"],
    "Mental Health Services": ["mental health services", "therapy", "counseling"],
    "Case Management": ["case management", "evaluations for asylum cases", "immigration law"]
}

def load_secrets():
    with open("secrets.json") as secrets_file:
        return json.load(secrets_file)

# returns list of services that are unique, based on coordinates
def remove_duplicates(sheets_services, query_services):
    # merge the two lists and then check the coordinates field for duplicates
    merged_services = []
    # choose all sheets services
    for service in sheets_services:
        merged_services.append(service)

    # add if the coordinates are not in merged services, url is not false
    for service in query_services:
        if service.coordinates[0][0] not in [s.coordinates[0][0] for s in merged_services] and service.coordinates[0][1] not in [s.coordinates[0][1] for s in merged_services] and service.ID:
            merged_services.append(service)

    return merged_services
    

    
def get_place_details(place_id):
    secrets = load_secrets()
    api_key = secrets["GOOGLE_API_KEY"]
    url = f"https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,formatted_address,geometry,opening_hours,website,formatted_phone_number,editorial_summary,url",
        "key": api_key
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get('result', {})
    else:
        print("Error:", response.status_code)
        return {}

# Query a service type and return a list of locations that match
def find_places(query, lat, lng, radius):
    if query in query_dict:
        keywords = query_dict[query]

    secrets = load_secrets()
    api_key = secrets["GOOGLE_API_KEY"]
    services = []

    for keyword in keywords:
        url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={keyword}&location={lat},{lng}&radius={radius}&key={api_key}"
        print(keyword)
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            if data['status'] == 'OK':
                for place in data['results']:
                    place_id = place['place_id']
                    place_details = get_place_details(place_id)
                    if place_details:
                        # Directly map place_details to service
                        service = map_to_service(place_details, query)
                        services.append(service)
            else:
                print("Error:", data['status'])
        else:
            print("Request failed:", response.status_code)
    return services

# Helper function for class builder, maps the json data to a service object
def map_to_service(place_data, query):
    return Service(
        ID=place_data.get("url")[place_data.get("url").find("cid=")+4:] if place_data.get("url") else None,
        name=place_data.get("name") if place_data.get("name") else None,
        servicetype=query if isinstance(query, list) else [query],  # Ensure servicetype is a list
        extrafilters=None,
        demographic=None,
        website=place_data.get("website") if place_data.get("website") else None,
        summary=place_data.get("editorial_summary", {}).get("overview", "") if place_data.get("editorial_summary") else None,
        address=place_data.get("formatted_address").split(";") if place_data.get("formatted_address") else [],  # Assuming multiple addresses are separated by ';'
        coordinates=[(place_data.get("geometry", {}).get("location").get("lat"), place_data.get("geometry", {}).get("location").get("lng"))] if place_data.get("geometry", {}).get("location") else [],  # Ensure coordinates are in a list of tuples
        neighborhoods=None,
        hours=None,
        phone=place_data.get("formatted_phone_number") if place_data.get("formatted_phone_number") else None,
        languages=["English"], 
        googlelink=place_data.get("url") if place_data.get("url") else None,
        source="Google Maps API"
    )


def get_coordinates(location):
    location = location.replace(" ", "+")
    secrets = load_secrets()
    api_key = secrets["GOOGLE_API_KEY"]
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={api_key}"
    
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK':
            coordinates = data['results'][0]['geometry']['location']
            return coordinates['lat'], coordinates['lng']
        else:
            print("Error:", data['status'])
    else:
        print("Request failed:", response.status_code)

def main():
    lat, lng = 42.3601, -71.0589  # Boston
    radius = 3000  # in meters
    query = "Food"

    services = find_places(query, lat, lng, radius)
    for service in services:
        print(service.__dict__)

if __name__ == "__main__":
    main()
