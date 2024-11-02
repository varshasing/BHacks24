import requests
import json

def load_secrets():
    with open("secrets.json") as secrets_file:
        return json.load(secrets_file)
    
def get_place_details(place_id):
    secrets = load_secrets()
    api_key = secrets["GOOGLE_API_KEY"]
    url = f"https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,formatted_address,geometry,opening_hours,website,formatted_phone_number",
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
            return places
        else:
            print("Error:", data['status'])
    else:
        print("Request failed:", response.status_code)



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
    radius = 500  #in meters
    query = "food bank"

    places = find_places(query, lat, lng, radius)
    for place in places:
        name = place.get('name', 'N/A')
        address = place.get('formatted_address', 'N/A')
        coordinates = place['geometry']['location']
        phonenumber = place.get('formatted_phone_number')
        latitude = coordinates['lat']
        longitude = coordinates['lng']
        print(f"Name: {name}, Address: {address}, Coordinates: ({latitude}, {longitude}), Phone number: {phonenumber}")

if __name__ == "__main__":
    main()

