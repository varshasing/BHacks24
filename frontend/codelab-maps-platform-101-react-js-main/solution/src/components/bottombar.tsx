import React, { useState, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Box, TextField, List, ListItem, ListItemText, Typography, Slider, Button, FormControlLabel, Checkbox, Collapse } from '@mui/material';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import { Poi } from '../app';
interface SearchResult {
    displayName: string;
    latitude: string;
    longitude: string;
    address: Record<string, string>;
}

interface BottomBarProps {
    mapCenter: google.maps.LatLngLiteral | null;
    setMapCenter: (latitude: number, longitude: number) => void;
    setRadius: (radius: number) => void;
    radius: number;
    setShowButtons: Dispatch<SetStateAction<boolean>>;
    updateLocationPins: (query: string, lat: number, lng: number, radius: number, setLocations: React.Dispatch<React.SetStateAction<Poi[]>>) => Promise<void>;
    setLocations: React.Dispatch<React.SetStateAction<Poi[]>>;

}
const BottomBar: React.FC<BottomBarProps> = ({ mapCenter, setMapCenter, setRadius, radius, setShowButtons, updateLocationPins, setLocations }) => {
    const [focused, setFocused] = useState<boolean>(false);
    const [searchingFocus, setSearchingFocus] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const categories = ["Education", "Legal", "Housing/Shelter", "Healthcare", "Food", "Employment", "Community Education", "Cash Assistance", "Mental Health Services", "Case Management"];

    const handleCancel = () => {
        setSearchingFocus(false);
        setFocused(false);
        setShowOptions(false); // Reset options view when canceled
        setShowButtons(true);
    };
    async function searchOpenStreetMap(query: string): Promise<SearchResult[]> {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const data = await response.json();
            return data.map((result: any) => ({
                displayName: result.display_name,
                latitude: result.lat,
                longitude: result.lon,
                address: result.address,
            }));
        } catch (error) {
            console.error("Error fetching data from OpenStreetMap:", error);
            return [];
        }
    }

    const handleNext = () => {
        setShowOptions(true); // Show options screen upon clicking "Next"
    };

    const handleSearchOptions = () => {
        if (mapCenter) {
            updateLocationPins(selectedOptions[0], mapCenter.lat, mapCenter.lng, radius, setLocations);
        }
        handleCancel();
    };

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const newQuery = event.target.value;
        setQuery(newQuery);

        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        const newTimeout = setTimeout(async () => {
            if (newQuery) {
                const searchResults = await searchOpenStreetMap(newQuery);
                setResults(searchResults);
            } else {
                setResults([]);
            }
        }, 1000); // Delay of 1 second

        setDebounceTimeout(newTimeout);
    };

    const handleRadiusChange = (event: Event, newValue: number | number[]) => {
        setRadius(newValue as number);
    };

    const handleLocationSelect = (result: SearchResult | null) => {
        if (!result) {
            navigator.geolocation.getCurrentPosition((position) => {
                setMapCenter(position.coords.latitude, position.coords.longitude);
            });
            setQuery('');
            setResults([]);
            setSearchingFocus(false);
            return;
        }
        setQuery(result.displayName);
        setSelectedLocation(result);
        setResults([]);
        setSearchingFocus(false);
        setMapCenter(parseFloat(result.latitude), parseFloat(result.longitude));
    };

    const handleOptionChange = (option: string) => {
        setSelectedOptions(prev =>
            prev.includes(option) ? prev.filter(opt => opt !== option) : [...prev, option]
        );
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                // width: !showOptions ? '80%' : 'auto',
                width: '80%',
                backgroundColor: '#fff',
                boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
                padding: '10px 20px',
                borderRadius: '30px',
                transition: 'padding 0.3s ease, height 0.3s ease', // Smooth transition
                zIndex: 1,
            }}
            onFocus={() => { setFocused(true); setShowButtons(false); }}
            tabIndex={-1}
        >
            <Collapse in={!showOptions}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f1f1f1',
                        borderRadius: '20px',
                        px: 2,
                    }}
                >
                    <SearchIcon sx={{ color: 'grey.600', mr: 1 }} />
                    <TextField
                        autoComplete="off"
                        placeholder="Search location"
                        variant="standard"
                        fullWidth
                        value={query}
                        onChange={handleSearch}
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: '16px' },
                        }}
                        onFocus={() => setSearchingFocus(true)}
                    />
                </Box>

                <Collapse in={searchingFocus}>
                    <List sx={{
                        width: '80%',
                        overflowY: 'auto',
                        maxHeight: '50vh',
                        backgroundColor: '#fff',
                        borderRadius: '10px',
                        mt: 1,
                        px: 2,
                    }}>
                        <ListItem key={-1} component="div" onClick={() => handleLocationSelect(null)}>
                            <ListItemText primary="Current Location" />
                        </ListItem>

                        {results.map((result, index) => (
                            <ListItem key={index} component="div" onClick={() => handleLocationSelect(result)}>
                                <ListItemText primary={result.displayName} />
                            </ListItem>
                        ))}
                    </List>
                </Collapse>

                <Collapse in={focused && !searchingFocus}>
                    <Box sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '90%', flexDirection: 'row', paddingY: 2 }}>
                            <Slider
                                value={radius}
                                min={1}
                                max={20}
                                step={1}
                                onChange={handleRadiusChange}
                                aria-labelledby="radius-slider"
                                sx={{ flexGrow: 1 }}
                            />
                            <Typography id="radius-slider" sx={{ ml: 2 }}>
                                {radius + "km"}
                            </Typography>
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}>
                            <Button variant="outlined" color="secondary" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" onClick={handleNext}>
                                Next
                            </Button>
                        </Box>
                    </Box>
                </Collapse>
            </Collapse>

            <Collapse in={showOptions}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '10px',
                    px: 2,
                }}>
                    <Typography variant="h6">Select Service</Typography>
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Select Service</InputLabel>
                            <Select
                                value={selectedOptions[0] || ''}
                                onChange={(event) => setSelectedOptions([event.target.value])}
                                label="Select Service"
                            >
                                {categories.map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSearchOptions}>
                        Search
                    </Button>
                </Box>
            </Collapse>
        </Box>
    );
};

export default BottomBar;
