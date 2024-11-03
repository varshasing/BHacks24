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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
import AddLocationForm from './addLocationForm';

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
    const defaultCenter = { lat: -33.860664, lng: 151.208138 };
    const map = useMap();
    const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});
    const clusterer = useRef<MarkerClusterer | null>(null);
    const [radius, setRadius] = useState<number>(1); // in km
    const [center, setCenter] = useState<google.maps.LatLngLiteral | null>(defaultCenter);
    const [isStreetView, setIsStreetView] = useState(false);
    const [showButtons, setShowButtons] = useState(true);
    const [showLogo, setShowLogo] = useState(true);

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
        map.
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
            console.log('toggle street view');
          const streetView = map.getStreetView();
          console.log("streetview obj", streetView);
          const mapCenter = center;
          streetView.setPosition(mapCenter);
          streetView.setPov({ heading: 0, pitch: 0 });
          console.log('mapCenter:', mapCenter);
          if (isStreetView) {
            // Exit Street View
            setShowLogo(true);
            streetView.setVisible(false);
          } else {
            // Enter Street View at the current map center
            setShowLogo(false);

            streetView.setVisible(true);
          }
          setIsStreetView(!isStreetView); // Toggle state
        }
      }, [map, isStreetView]);

    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleAddLocationClick = () => {
        setShowButtons(false);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setShowButtons(true);
    };

    const handleFormSubmit = (formData) => {
        console.log('Location data submitted:', formData);
        setIsFormOpen(false); // Close form after submission
        // Add the new location data to the map or database here
    };
    
    return (
        <>
        <a href='https://www.urbanrefuge.org/' target='_blank'>
        { showLogo && (<img
            src={'/ur_logo.png'}
            alt="Logo"
            style={{
              position: 'fixed',
              top: '20px',
              left: '20px',
              width: '75px', // Adjust width as needed
              height: 'auto',
              zIndex: 2000,
              borderRadius: '8px', // Adjust the radius as needed for roundness
            }}
          />)}
          
        </a>
        
            <Map
                mapId="da37f3254c6a6d1c"
                defaultZoom={13}
                defaultCenter={defaultCenter}
                onCameraChanged={(ev: MapCameraChangedEvent) => {
                    const newCenter = ev.detail.center;
                    console.log('camera changed:', newCenter, 'zoom:', ev.detail.zoom);
                    setCenter(newCenter); // Update circle center when camera changes
                }}
          options={{
            mapTypeControl: false,         // Remove map/satellite toggle
            zoomControl: false,            // Remove zoom buttons
            fullscreenControl: false,      // Remove fullscreen button
            streetViewControl: false,      // Remove Street View control
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
            <BottomBar setMapCenter={setMapCenter} radius={radius} setRadius={setRadius} setShowButtons={setShowButtons}/>
            { showButtons && (
              <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddLocationClick}
              sx={{
                position: 'fixed',
                bottom: '80px',
                right: '80px',
                zIndex: 1500,
                width: '48px', // Twice the default size (48px)
                height: '48px', // Same as width for a circular shape
                borderRadius: '50%', // Makes the button circular
                minWidth: '0px', // Prevents default button minWidth from affecting the size
              }}
            >
              <FontAwesomeIcon icon={faEdit} size="2x" />
            </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={toggleStreetView}
                sx={{
                  position: 'fixed',
                  bottom: '80px',
                  right: '20px',
                  zIndex: 1500,
                  width: '48px', // Twice the default size (48px)
                  height: '48px', // Same as width for a circular shape
                  borderRadius: '50%', // Makes the button circular
                  minWidth: '0px', // Prevents default button minWidth from affecting the size
                }}
              >
                {isStreetView ? <FontAwesomeIcon icon={faMap} size="2x" /> : <FontAwesomeIcon icon={faEye} size="2x" />}
              </Button>
              </>

            )

            }
            
            <AddLocationForm
                open={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
            />
        </>
    );
};

export default MapContainer;
