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

  return (
    <APIProvider apiKey={google_maps_api_key} onLoad={() => console.log('Maps API has loaded.')}>
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
    </APIProvider>
  );
};

const root = createRoot(document.getElementById('app'));
root.render(<App />);

export default App;
