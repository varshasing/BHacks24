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
    const [radius, setRadius] = useState<number>(10); // in km
    const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(null);

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

    return (
        <>
            <Map
                defaultZoom={13}
                defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
                onCameraChanged={(ev: MapCameraChangedEvent) => {
                    const newCenter = ev.detail.center;
                    console.log('camera changed:', newCenter, 'zoom:', ev.detail.zoom);
                    setCenter(newCenter); // Update circle center when camera changes
                }}
                mapId="da37f3254c6a6d1c"
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
        </>
    );
};

export default MapContainer;
