import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { APIProvider, Map, useMap, AdvancedMarker, MapCameraChangedEvent, Pin } from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { Marker } from '@googlemaps/markerclusterer';
import google_maps_api_key from '../secrets';
import { Circle } from './components/circle';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { InfoWindow } from '@vis.gl/react-google-maps';

type Poi = { key: string, location: google.maps.LatLngLiteral, name: string };
const locations: Poi[] = [
  { key: 'operaHouse', location: { lat: -33.8567844, lng: 151.213108 }, name: 'Sydney Opera House' },
  { key: 'tarongaZoo', location: { lat: -33.8472767, lng: 151.2188164 }, name: 'Taronga Zoo' },
  { key: 'manlyBeach', location: { lat: -33.8209738, lng: 151.2563253 }, name: 'Manly Beach' },
];

const App = () => (
  <APIProvider apiKey={google_maps_api_key} onLoad={() => console.log('Maps API has loaded.')}>
    <Map
      defaultZoom={13}
      defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
      onCameraChanged={(ev: MapCameraChangedEvent) =>
        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
      }
      mapId='da37f3254c6a6d1c'
    >
      <PoiMarkers pois={locations} />
    </Map>
  </APIProvider>
);

const PoiMarkers = (props: { pois: Poi[] }) => {
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [circleCenter, setCircleCenter] = useState(null);

  const handleClick = useCallback((poi: Poi) => {
    setSelectedPoi(poi); // Set the selected POI for the InfoWindow
    if (map) {
      map.panTo(poi.location);
      setCircleCenter(poi.location);
    }
  }, [map]);

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
        strokeColor={'#0c4cb3'}
        strokeOpacity={1}
        strokeWeight={3}
        fillColor={'#3b82f6'}
        fillOpacity={0.3}
      />
      {props.pois.map((poi: Poi) => (
        // MARKER COMPONENT
        <AdvancedMarker
          key={poi.key}
          position={poi.location}
          ref={marker => setMarkerRef(marker, poi.key)}
          clickable={true}
          onClick={() => handleClick(poi)}
        >
          <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'}>
            <FontAwesomeIcon icon={faGavel} color='brown' />
          </Pin>
        </AdvancedMarker>
      ))}
      {selectedPoi && (
        <InfoWindow
          position={selectedPoi.location}
          onCloseClick={() => setSelectedPoi(null)}
        >
          <div>{selectedPoi.name}</div>
        </InfoWindow>
      )}
    </>
  );
};

export default App;

const root = createRoot(document.getElementById('app'));
root.render(<App />);
