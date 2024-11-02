# parse spreadsheet data, create classes from the data, and pass classes to the server (stores)
import gspread
from google.oauth2.service_account import Credentials
from service import Service
import sys
import os

# Append the parent directory to the path for module imports
sys.path.append(os.path.abspath(".."))
import map  # Ensure map.py is in the parent directory

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
    for row in data:
        address_list = row["Address"].split(";")
        coordinate_list = []
        for address in address_list:
            if len(address) > 3:
                coordinates = map.get_coordinates(address)
                coordinate_list.append(coordinates)
                
        service = Service(
            row["Name of Organization "],
            row["Service Type"],
            row["Extra Filters"],
            row["Who are these services for? (refugees, asylees, TPS, parolees, any status, etc.)"],
            row["Website"],
            row["Summary of Services"],
            address_list,
            row["Address Notes"],
            coordinate_list,
            row["Neighborhood"],
            row["Hours"],
            row["Phone Number (for public to contact)"],
            row["Services offered in these languages"],
            URAverifed=True,
            googlelink=False
        )
        services.append(service)
    
    return services
