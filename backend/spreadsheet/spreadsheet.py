# parse spreadsheet data, create classes from the data, and pass classes to the server (stores)
import gspread
from google.oauth2.service_account import Credentials
from service import Service
import sys


sys.path.append('/Users/Varsha/Desktop/Boston University/Junior/BHACKS/BHacks24/BHacks24/backend/')

import map

# Define the scope
scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"  # For file access
]

# Load service account credentials with defined scopes
creds = Credentials.from_service_account_file('/Users/Varsha/Downloads/balmy-virtue-440518-c9-1dbeaecb35aa.json', scopes=scopes)

# Authorize the client
client = gspread.authorize(creds)

# Attempt to open the spreadsheet
try:
    spreadsheet = client.open("UrbanRefugeAidServices")  # Replace with your actual sheet name
    sheet = spreadsheet.sheet1  # Access the first worksheet

    # Retrieve all data from the sheet
    data = sheet.get_all_records()
    #print("Data from sheet:", data)

except Exception as e:
    print("An error occurred:", e)



# I need to create a list of Service objects from the data
services = []
for row in data:
    address_list = row["Address"].split(";")
    coordinate_list = []
    for address in address_list:
        if len(address) > 3:
            coordinates = map.get_coordinates(address)
            coordinate_list.append(coordinates)
    service = Service(row["Name of Organization "], row["Service Type"], row["Extra Filters"], row["Who are these services for? (refugees, asylees, TPS, parolees, any status, etc.)"], row["Website"], row["Summary of Services"], address_list, row["Address Notes"], coordinate_list, row["Neighborhood"], row["Hours"], row["Phone Number (for public to contact)"], row["Services offered in these languages"], URAverifed=True)
    services.append(service)