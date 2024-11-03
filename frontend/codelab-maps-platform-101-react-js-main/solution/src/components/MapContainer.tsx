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
import { Poi } from '../app';
export interface Location {
  ID: string;
  name: string;
  servicetype: string[];
  extrafilters: string[];
  demographic: string;
  website: string;
  summary: string;
  address: string[];
  coordinates: string[];
  neighborhoods: string;
  hours: string;
  phone: string;
  languages: string[];
  googlelink: string;
  source: string;
}


// type Poi = {
//     location: google.maps.LatLngLiteral;
//     name: string;
//     services: string[];
//     languages: string[];
//     phone: string;
//     address: string;
//     website: string;
//     demographics: string;
//     summary: string;
//     hours: string;
// };

interface MapContainerProps {
    locations: Poi[];
  updateLocationPins: (query: string, lat: number, lng: number, radius: number, setLocations: React.Dispatch<React.SetStateAction<Poi[]>>) => Promise<void>;
    onMarkerClick: (location: Poi) => void;
  setLocations: React.Dispatch<React.SetStateAction<Poi[]>>;
}

const MapContainer: React.FC<MapContainerProps> = ({ locations, updateLocationPins, onMarkerClick, setLocations }) => {
    const defaultCenter = { lat: 42.35138, lng: -71.11551 };
    const map = useMap();
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (map) {
      setIsMapLoaded(true); // Set state when the map has loaded
    }
  }, [map]);

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
          {isMapLoaded && locations.map((poi) => (
                    <AdvancedMarker
                        key={poi.name}
                        position={poi.location}
                        clickable
                        onClick={(ev) => handleMarkerClick(ev, poi)}
                        options={{
                          icon: {
                            url: '/globe.png', // Replace with your image URL
                            scaledSize: new google.maps.Size(40, 40), // Adjust the size as needed
                          },
                        }}
                    >
              <img
                src={poi.upvote < 10 ? "/1.png" : (poi.upvote < 20 ? "/2.png" : "/3.png")} // Replace with your image URL
                alt="Location Icon"
                style={{ width: '30px', height: '45px' }} // Adjust the dimensions as needed
              />
                    </AdvancedMarker>
                ))}
                {center && (
                    <Circle
                        center={center}
                        radius={radius * 1609.34 / 2} // Convert km to meters
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
        <BottomBar mapCenter={center} setMapCenter={setMapCenter} radius={radius} setRadius={setRadius} setShowButtons={setShowButtons} updateLocationPins={updateLocationPins} setLocations={setLocations}/>
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
                center={center}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
                setLocationPins={setLocations}
            />
        </>
    );
};

export default MapContainer;
