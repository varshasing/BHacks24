# Define the class for the spreadsheet data
class Service:
    def __init__(self, ID, name, servicetype, extrafilters, demographic, website, summary, address, coordinates, neighborhoods, hours, phone, languages, googlelink, source):
        self.ID = ID #string
        self.name = name #string
        self.servicetype = servicetype #list of strings
        self.extrafilters = extrafilters #list of strings
        self.demographic = demographic #string
        self.website = website #string
        self.summary = summary #string
        self.address = address #list of string
        self.coordinates = coordinates #list of tuples
        self.neighborhoods = neighborhoods #list of strings
        self.hours = hours #string
        self.phone = phone #string
        self.languages = languages #list of strings
        self.googlelink = googlelink #string
        self.source = source #string
