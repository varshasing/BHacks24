import requests
import json
from service import Service

def load_secrets():
    with open("secrets.json") as secrets_file:
        return json.load(secrets_file)
    
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


#query a service type and return a json string of locations that match
def find_places(query, lat, lng, radius):
    secrets = load_secrets()
    api_key = secrets["GOOGLE_API_KEY"]
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&location={lat},{lng}&radius={radius}&key={api_key}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK':
            places = []
            for place in data['results']:
                place_id = place['place_id']
                place_details = get_place_details(place_id)
                if place_details:
                    places.append(place_details)
            
            services = map_to_service(places, query)
            return services
        else:
            print("Error:", data['status'])
    else:
        print("Request failed:", response.status_code)


#helper function for class builder, maps the json data to a service object
def map_to_service(places, query):
    services = []
    for place_data in places:
        service = Service(
            name=place_data.get("name"),
            servicetype=query, 
            extrafilters="", 
            demographic="", 
            website=place_data.get("website"),
            summary=place_data.get("editorial_summary"), 
            address=place_data.get("formatted_address"),
            coordinates=place_data.get("geometry", {}).get("location"),
            neighborhoods="", 
            hours="",
            phone=place_data.get("formatted_phone_number"),
            languages="English", 
            googlelink=place_data.get("url"),
            URAverifed=False  
        )
        services.append(service)
    return services
    
    


#helper function for class builder
#receives a string, and returns a coordinate pair
def get_coordinates(location):
    #URL encode the location
    location = location.replace(" ", "+")
    secrets = load_secrets()
    api_key = secrets["GOOGLE_API_KEY"]
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={location}&key={api_key}"
    
    #send request
    response = requests.get(url)
    
    #parse the JSON response
    if response.status_code == 200:
        data = response.json()
        if data['status'] == 'OK':
            # Get the first result's coordinates
            coordinates = data['results'][0]['geometry']['location']
            latitude = coordinates['lat']
            longitude = coordinates['lng']
            return latitude, longitude
        else:
            print("Error:", data['status'])
    else:
        print("Request failed:", response.status_code)



def main():
    # location = "442 Main Street, Malden, MA 02148"
    # lat, lng = get_coordinates(location)
    # print(f"Coordinates of {location}: Latitude = {lat}, Longitude = {lng}")

    lat, lng = 42.3601, -71.0589  #boston
    radius = 3000  #in meters
    query = "food bank"

    services = find_places(query, lat, lng, radius)
    for service in services:
        print(service.__dict__)

    

if __name__ == "__main__":
    main()

