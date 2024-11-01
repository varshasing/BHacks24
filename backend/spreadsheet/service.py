# Define the class for the spreadsheet data
class Service:
    def __init__(self, name, servicetype, extrafilters, demographic, website, summary, address, coordinates, neighborhoods, hours, phone, languages, googlelink, URAverifed):
        self.name = name
        self.servicetype = servicetype
        self.extrafilters = extrafilters
        self.demographic = demographic
        self.website = website
        self.summary = summary
        self.address = address # has to be a list of coordinates since there can be multiple locations
        self.coordinates = coordinates
        self.neighborhoods = neighborhoods
        self.hours = hours
        self.phone = phone
        self.languages = languages
        self.googlelink = googlelink
        self.URAverifed = URAverifed