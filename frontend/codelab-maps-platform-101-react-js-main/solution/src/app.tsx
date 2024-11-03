import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  MapCameraChangedEvent,
  Pin,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import google_maps_api_key from '../secrets';
import Profile from './components/profile';
import BottomBar from './components/bottombar';
import MapContainer from './components/MapContainer';
import AddLocationForm from './components/addLocationForm';
import {Button} from '@mui/material';
type Poi = {
  location: google.maps.LatLngLiteral;
  name: string;
  services: string[];
  languages: string[];
  phone: string;
  address: string;
  website: string;
  demographics: string;
  summary: string;
  hours: string;
};

const locations: Poi[] = [
  {
    location: { lat: -33.8567844, lng: 151.213108 },
    name: 'Catholic Charities',
    services: ['Education', 'Housing/Shelter', 'Food', 'Legal'],
    summary: 'family and youth services',
    address: '275 W Broadway, Boston, MA 02127',
    hours: '7:30am - 6pm',
    demographics: 'Any Status',
    languages: ['English'],
    website: 'https://www.ccab.org/what-we-do/',
    phone: '617-464-8500',
  },
];

const App = () => {
  const [selectedLocation, setSelectedLocation] = useState<Poi | null>(null);

  const handleBack = () => {
    setSelectedLocation(null);
  };

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddLocationClick = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleFormSubmit = (formData) => {
    console.log('Location data submitted:', formData);
    setIsFormOpen(false); // Close form after submission
    // Add the new location data to the map or database here
  };

  return (
    <APIProvider apiKey={google_maps_api_key} onLoad={() => console.log('Maps API has loaded.')}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddLocationClick}
        sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1200 }}
      >
        Add Location
      </Button>
      <MapContainer
        locations={locations}
        onMarkerClick={setSelectedLocation}
      />
      {selectedLocation && (
        <Profile
          name={selectedLocation.name}
          services={selectedLocation.services}
          languages={selectedLocation.languages}
          phone={selectedLocation.phone}
          address={selectedLocation.address}
          website={selectedLocation.website}
          demographics={selectedLocation.demographics}
          summary={selectedLocation.summary}
          hours={selectedLocation.hours}
          onBack={handleBack}
        />
      )}

      <AddLocationForm
        open={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />
    </APIProvider>
  );
};

const root = createRoot(document.getElementById('app'));
root.render(<App />);

export default App;
