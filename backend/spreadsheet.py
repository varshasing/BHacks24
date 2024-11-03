# parse spreadsheet data, create classes from the data, and pass classes to the server (stores)
import gspread
from google.oauth2.service_account import Credentials
from service import Service
import map
import hashlib

def hash_organization_name(name):
    return hashlib.sha256(name.encode()).hexdigest()


def fetch_and_process_spreadsheet_data(sheet_name, json_key_path):
    """
    Parses spreadsheet data, creates Service objects, and returns a list of Service instances.

    Args:
        sheet_name (str): The name of the Google Sheet to open.
        json_key_path (str): Path to the service account JSON key file.

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
    for i, row in data:
        address_list = row["Address"].split(";")
        coordinate_list = []
        for address in address_list:
            if len(address) > 3:
                coordinates = map.get_coordinates(address)
                coordinate_list.append(coordinates)
        
        org_name = row["Name of Organization"]
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
    
    return services

def main():
    services = fetch_and_process_spreadsheet_data(
        'UrbanRefugeAidServices', 
        'balmy-virtue-440518-c9-1dbeaecb35aa.json'
    )
    for service in services:
        print(service.__dict__)

if __name__ == "__main__":
    main()
