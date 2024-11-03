# Define the class for the spreadsheet data
class Service:
    def __init__(self, ID, name, servicetype, extrafilters, demographic, website, summary, address, coordinates, neighborhoods, hours, phone, languages, googlelink, source):
        self.ID = ID
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
        self.googlelink = googlelink
        self.source = source
