import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Map,
    useMap,
    AdvancedMarker,
    Pin,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import BottomBar from './bottombar';
import { MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { Circle } from './circle';
import { Button } from '@mui/material';
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

interface MapContainerProps {
    locations: Poi[];
    onMarkerClick: (location: Poi) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({ locations, onMarkerClick }) => {
    const map = useMap();
    const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});
    const clusterer = useRef<MarkerClusterer | null>(null);
    const [radius, setRadius] = useState<number>(1); // in km
    const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);
    const [isStreetView, setIsStreetView] = useState(false);

    const handleMarkerClick = useCallback(
        (ev: google.maps.MapMouseEvent, location: Poi) => {
            if (!map || !ev.latLng) return;
            map.panTo(ev.latLng);
            onMarkerClick(location);
            setCenter(ev.latLng.toJSON()); // Update center when a marker is clicked
        },
        [map, onMarkerClick]
    );

    useEffect(() => {
        if (!map || clusterer.current) return;
        clusterer.current = new MarkerClusterer({ map });
        setCenter(map.getCenter()?.toJSON() ?? null); // Set initial center
    }, [map]);

    const setMapCenter = (latitude: number, longitude: number) => {
        if (map) {
            const newCenter = { lat: latitude, lng: longitude };
            map.panTo(newCenter);
            setCenter(newCenter); // Update the circle center
        }
    };

    const toggleStreetView = useCallback(() => {
        if (map) {
          const streetView = map.getStreetView();
          const mapCenter = map.getCenter();
    
          if (isStreetView) {
            // Exit Street View
            streetView.setVisible(false);
          } else {
            // Enter Street View at the current map center
            streetView.setPosition(mapCenter);
            streetView.setPov({ heading: 0, pitch: 0 });
            streetView.setVisible(true);
          }
          setIsStreetView(!isStreetView); // Toggle state
        }
      }, [map, isStreetView]);

    return (
        <>
            <Map
                mapId="da37f3254c6a6d1c"
                defaultZoom={13}
                defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
                onCameraChanged={(ev: MapCameraChangedEvent) => {
                    const newCenter = ev.detail.center;
                    console.log('camera changed:', newCenter, 'zoom:', ev.detail.zoom);
                    setCenter(newCenter); // Update circle center when camera changes
                }}
                options={{
                    mapTypeControl: false,  // Remove map/satellite toggle
                    zoomControl: false,      // Remove zoom buttons
                    fullscreenControl: false, // Optional: Remove fullscreen button
                    streetViewControl: false, // Optional: Remove Street View control
                  }}
            >
                {locations.map((poi) => (
                    <AdvancedMarker
                        key={poi.name}
                        position={poi.location}
                        clickable
                        onClick={(ev) => handleMarkerClick(ev, poi)}
                    >
                        <Pin background="#FBBC04" glyphColor="#000" borderColor="#000" />
                    </AdvancedMarker>
                ))}
                {center && (
                    <Circle
                        center={center}
                        radius={radius * 1000} // Convert km to meters
                        options={{
                            strokeColor: '#0c4cb3',
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: '#3b82f6',
                            fillOpacity: 0.2,
                        }}
                    />
                )}
            </Map>
            <BottomBar setMapCenter={setMapCenter} radius={radius} setRadius={setRadius} />

            <Button
                variant="contained"
                color="primary"
                onClick={toggleStreetView}
                sx={{
                position: 'fixed',
                bottom: '80px',
                right: '20px',
                zIndex: 1500,
                }}
            >
                {isStreetView ? 'Exit Street View' : 'Enter Street View'}
            </Button>

        </>
    );
};

export default MapContainer;
