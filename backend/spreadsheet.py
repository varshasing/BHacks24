# parse spreadsheet data, create classes from the data, and pass classes to the server (stores)
import gspread
from google.oauth2.service_account import Credentials
from service import Service
import math
import hashlib
import map

def hash_organization_name(name):
    return hashlib.sha256(name.encode()).hexdigest()

def filtering_service_type(service_list, service_types):
    """
    Filters the list of services by service type.

    Args:
        service_list (list): A list of Service objects. Each object can have multiple service_type matches, only want one
        service_types (list): A list of service types to filter by.

    Returns:
        filtered_list: A list of Service objects that match the service type.
    """
    filtered_list = []

    for service in service_list:
        # Check if there's an intersection
        if any(service_type in service.servicetype for service_type in service_types):
            filtered_list.append(service)
    return filtered_list


def fetch_and_process_spreadsheet_data(sheet_name, json_key_path, lat, lng, radius, service_types):
    """
    Parses spreadsheet data, creates Service objects, and returns a list of Service instances.

    Args:
        sheet_name (str): The name of the Google Sheet to open.
        json_key_path (str): Path to the service account JSON key file.
        service_type (str): A list of service types to filter by.

    Returns:
        list: A list of Service objects created from the spreadsheet data.
    """
    # Define the scope
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]

    # Load service account credentials with defined scopes
    creds = Credentials.from_service_account_file(json_key_path, scopes=scopes)

    # Authorize the client and open the spreadsheet
    client = gspread.authorize(creds)
    
    try:
        spreadsheet = client.open(sheet_name)
        sheet = spreadsheet.sheet1  # Access the first worksheet
        data = sheet.get_all_records()  # Retrieve all data from the sheet

    except Exception as e:
        print("An error occurred:", e)
        return []

    # Process data and create Service instances
    services = []
    for row in data:
        address_list = row["Address"].split(";")
        coordinate_list = []
        for address in address_list:
            if len(address) > 3:
                coordinates = map.get_coordinates(address)
                coordinate_list.append(coordinates)
        
        org_name = row["Name of Organization "]
        unique_id = hash_organization_name(org_name)

        service = Service(
            ID=unique_id, 
            name=org_name,
            servicetype=row["Service Type"],
            extrafilters=row["Extra Filters"],
            demographic=row["Who are these services for? (refugees, asylees, TPS, parolees, any status, etc.)"],
            website=row["Website"],
            summary=row["Summary of Services"],
            address=address_list,
            coordinates=coordinate_list,
            neighborhoods=row["Neighborhood"],
            hours=row["Hours"],
            phone=row["Phone Number (for public to contact)"],
            languages=row["Services offered in these languages"],
            googlelink=False,
            source="Urban Refuge Aid"
        )
        services.append(service)

    services_lists = filter_by_distance(services, lat, lng, radius)
    filtered_list = filtering_service_type(services_lists, service_types)
    return filtered_list


def filter_by_distance(services, lat, lng, radius):
    filtered_services = []

    for service in services:
        print(service.coordinates)

        # Assuming coordinates is a list of tuples (lat, lng)
        for coordinates in service.coordinates:
            # Unpack the coordinates tuple
            service_lat, service_lng = coordinates

            if calculate_distance(lat, lng, service_lat, service_lng) <= radius:
                filtered_services.append(service)
                break  # Only add the service once if it meets the distance condition

    return filtered_services



import math

def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Calculates the distance between two geographic points using the Haversine formula.

    Args:
        lat1 (float): Latitude of the first point.
        lng1 (float): Longitude of the first point.
        lat2 (float): Latitude of the second point.
        lng2 (float): Longitude of the second point.

    Returns:
        float: Distance in meters.
    """
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lng1_rad = math.radians(lng1)
    lat2_rad = math.radians(lat2)
    lng2_rad = math.radians(lng2)

    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lng2_rad - lng1_rad
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2)
    c = 2 * math.asin(math.sqrt(a))

    # Radius of the Earth in meters (mean radius)
    radius_of_earth_meters = 6371000
    return c * radius_of_earth_meters



def main():
    lat = 42.3601
    lng = -71.0589
    radius = 5000  #500m

    services = fetch_and_process_spreadsheet_data(
        'UrbanRefugeAidServices',
        'balmy-virtue-440518-c9-1dbeaecb35aa.json', lat, lng, radius, ["Food"]
    )
    #filtered_services = filter_by_distance(services, lat, lng, radius)
    for service in services:
        print(service.__dict__)
    print("done")

if __name__ == "__main__":
    main()