import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import type { Marker } from '@googlemaps/markerclusterer';
import google_maps_api_key from '../secrets';
import { Circle } from './components/circle';
import Profile from './components/profile';

type Poi = {
  key: string;
  location: google.maps.LatLngLiteral;
  name: string;
  type: string;
  languages: string[];
  phone: string;
  address: string;
  website: string;
};

const locations: Poi[] = [
  { key: 'operaHouse', location: { lat: -33.8567844, lng: 151.213108 }, name: 'Opera House', type: 'Landmark', languages: ['English'], phone: '123-456-7890', address: 'Sydney, NSW', website: 'https://example.com' },
  { key: 'tarongaZoo', location: { lat: -33.8472767, lng: 151.2188164 }, name: 'Taronga Zoo', type: 'Zoo', languages: ['English'], phone: '123-456-7891', address: 'Bradleys Head Rd, Mosman', website: 'https://example.com' },
  // Add more entries as needed
];

const App = () => {
  const [selectedLocation, setSelectedLocation] = useState<Poi | null>(null);

  // Function to handle back button click
  const handleBack = () => {
    setSelectedLocation(null);
  };

  return (
    <APIProvider apiKey={google_maps_api_key} onLoad={() => console.log('Maps API has loaded.')}>
      <Map
        defaultZoom={13}
        defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
        onCameraChanged={(ev: MapCameraChangedEvent) =>
          console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
        }
        mapId="da37f3254c6a6d1c"
      >
        <PoiMarkers pois={locations} onMarkerClick={setSelectedLocation} />
      </Map>

      {selectedLocation && (
        <Profile
          name={selectedLocation.name}
          type={selectedLocation.type}
          languages={selectedLocation.languages}
          phone={selectedLocation.phone}
          address={selectedLocation.address}
          website={selectedLocation.website}
          onBack={handleBack} // Pass handleBack as a prop to Profile
        />
      )}
    </APIProvider>
  );
};

const PoiMarkers = ({ pois, onMarkerClick }: { pois: Poi[]; onMarkerClick: (location: Poi) => void }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [circleCenter, setCircleCenter] = useState<google.maps.LatLng | null>(null);

  const handleClick = useCallback(
    (ev: google.maps.MapMouseEvent, location: Poi) => {
      if (!map || !ev.latLng) return;
      console.log('marker clicked:', location.name);
      map.panTo(ev.latLng);
      setCircleCenter(ev.latLng);
      onMarkerClick(location);
    },
    [map, onMarkerClick]
  );

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers(prev => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  return (
    <>
      <Circle
        radius={800}
        center={circleCenter}
        strokeColor="#0c4cb3"
        strokeOpacity={1}
        strokeWeight={3}
        fillColor="#3b82f6"
        fillOpacity={0.3}
      />
      {pois.map(poi => (
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={marker => setMarkerRef(marker, poi.key)}
          clickable={true}
          onClick={ev => handleClick(ev, poi)}
        >
          <Pin background="#FBBC04" glyphColor="#000" borderColor="#000" />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default App;

const root = createRoot(document.getElementById('app'));
root.render(<App />);
