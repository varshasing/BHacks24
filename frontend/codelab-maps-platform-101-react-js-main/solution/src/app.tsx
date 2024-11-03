import React, { useEffect, useState } from 'react';
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

import {Button} from '@mui/material';
import { BACKEND_BASE_URL } from './components/base_urls';
export type Poi = {
  ID: string;
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
  upvote: number;
};

interface Location {
  ID: string;
  name: string;
  servicetype: string[];
  extrafilters: string[];
  demographic: string;
  website: string;
  summary: string;
  address: string[];
  coordinates: number[][];
  neighborhoods: string;
  hours: string;
  phone: string;
  languages: string[];
  googlelink: string;
  source: string;
  upvote: number;
}

async function searchLocations(query: string, lat: number, lng: number, radius: number): Promise<Location[]> {
  const url = `${BACKEND_BASE_URL}/services?query=${encodeURIComponent(query)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from 211sandiego:", error);
    return [];
  }
}

const updateLocations = async (query: string, lat: number, lng: number, radius: number, setLocations: React.Dispatch<React.SetStateAction<Poi[]>>) => {
  const newLocations = await searchLocations(query, lat, lng, radius);
  console.log("API CALL", newLocations);
  let parsedLocations: Poi[] = [];
  newLocations.forEach((location: Location) => {
    console.log("LOCATION0", location.coordinates[0][0], location.coordinates[0][1]);
    // console.log("LOCATION1", location.coordinates[1], location.coordinates[1]);

    const poi: Poi = {
      ID: location.ID,
      location: { lat: location.coordinates[0][0], lng: location.coordinates[0][1]},
      name: location.name,
      services: location.servicetype,
      languages: location.languages,
      phone: location.phone,
      address: location.address.join(', '),
      website: location.website,
      demographics: location.demographic,
      summary: location.summary,
      hours: location.hours,
      upvote: location.upvote,
    };
    parsedLocations.push(poi);
  })
  const uniqueLocations = parsedLocations.reduce((acc, current) => {
    const duplicate = acc.find(poi => poi.name === current.name);
    if (!duplicate) {
      acc.push(current);
    }
    return acc;
  }, []);

  console.log("PARSED LOCATIONS", parsedLocations);
  setLocations(uniqueLocations);
  console.log("UNIQUE LOCATIONS", uniqueLocations);
};

const App = () => {
  const [locations, setLocations] = useState<Poi[]>([
  ]);
  const [selectedLocation, setSelectedLocation] = useState<Poi | null>(null);
  const handleBack = () => {
    setSelectedLocation(null);
  };

  const updateUpvote = (id: string, newUpvoteCount: number) => {
    setLocations(prevLocations =>
      prevLocations.map(location =>
        location.ID === id ? { ...location, upvote: newUpvoteCount } : location
      )
    );
  };

  return (
    <APIProvider apiKey={google_maps_api_key} onLoad={() => console.log('Maps API has loaded.')}>

      <MapContainer
        locations={locations}
        updateLocationPins={updateLocations}
        onMarkerClick={setSelectedLocation}
        setLocations={setLocations}
      />
      {selectedLocation && (
        <Profile
          ID={selectedLocation.ID}
          name={selectedLocation.name}
          services={selectedLocation.services}
          languages={selectedLocation.languages}
          phone={selectedLocation.phone}
          address={selectedLocation.address}
          website={selectedLocation.website}
          demographics={selectedLocation.demographics}
          summary={selectedLocation.summary}
          hours={selectedLocation.hours}
          upvote={selectedLocation.upvote}
          onBack={handleBack}
          onUpvote={updateUpvote}
        />
      )}

      
    </APIProvider>
  );
};

const root = createRoot(document.getElementById('app'));
root.render(<App />);

export default App;
