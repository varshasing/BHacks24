# parse spreadsheet data, create classes from the data, and pass classes to the server (stores)
import gspread
from google.oauth2.service_account import Credentials

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

# Define the class for the spreadsheet data
class Service:
    def __init__(self, name, servicetype, extrafilters, demographic, website, summary, address, coordinates, neighborhoods, hours, phone, languages, URAverifed):
        self.name = name
        self.servicetype = servicetype
        self.extrafilters = extrafilters
        self.demographic = demographic
        self.website = website
        self.summary = summary
        self.address = address
        self.coordinates = coordinates
        self.neighborhoods = neighborhoods
        self.hours = hours
        self.phone = phone
        self.languages = languages
        self.URAverifed = URAverifed

# I need to create a list of Service objects from the data
services = []
for row in data:
    service = Service(row["Name of Organization "], row["Service Type"], row["Extra Filters"], row["Who are these services for? (refugees, asylees, TPS, parolees, any status, etc.)"], row["Website"], row["Summary of Services"], row["Address"], row["Coordinates (for mapping later on?)"], row["Neighborhood"], row["Hours"], row["Phone Number (for public to contact)"], row["Services offered in these languages"], URAverifed=True)
    services.append(service)

