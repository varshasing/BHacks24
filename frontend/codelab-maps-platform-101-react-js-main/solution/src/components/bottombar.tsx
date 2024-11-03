import React, { useState, ChangeEvent } from 'react';
import { Box, TextField, List, ListItem, ListItemText, Typography, Slider, Button, FormControlLabel, Checkbox } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Dispatch, SetStateAction } from 'react';
interface SearchResult {
    displayName: string;
    latitude: string;
    longitude: string;
    address: Record<string, string>;
}

// async function requestServicePoints(): Promise<SearchResult[]> {

// }

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

interface BottomBarProps {
    setMapCenter: (latitude: number, longitude: number) => void;
    setRadius: (radius: number) => void;
    radius: number;
    setShowButtons: Dispatch<SetStateAction<boolean>>;
}

const BottomBar: React.FC<BottomBarProps> = ({ setMapCenter, setRadius, radius, setShowButtons }) => {
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

    const handleNext = () => {
        setShowOptions(true); // Show options screen upon clicking "Next"
    };



    const handleSearchOptions = () => {
        console.log(selectedOptions);
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
                console.log(searchResults);
            } else {
                setResults([]);
            }
        }, 1000); // Delay of 1 second

        setDebounceTimeout(newTimeout);
    };

    const handleRadiusChange = (event: Event, newValue: number | number[]) => {
        setRadius(newValue as number);
        console.log("Radius:", newValue);
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
        console.log("Selected Location:", result);
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
                width: '80%',
                backgroundColor: '#fff',
                boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
                padding: '10px 20px',
                paddingBottom: focused ? (searchingFocus ? '140%' : (!showOptions ? '25%' : '5%')) : '10px',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '30px',
                transition: 'padding-bottom 0.3s ease; padding-top 0.3s ease',

                zIndex: 1,
            }}
            onFocus={() => {setFocused(true); setShowButtons(false);}}
            tabIndex={-1}
        >
            {!showOptions ? (
                <>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        backgroundColor: '#f1f1f1',
                        borderRadius: '20px',
                        px: 2,
                    }}>
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

                    {searchingFocus && (
                        <List sx={{
                            position: 'absolute',
                            top: '50px',
                            width: '80%',
                            bottom: '10%',
                            overflowY: 'auto',
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                            mt: 1,
                            '::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '::-webkit-scrollbar-thumb': {
                                backgroundColor: '#888',
                                borderRadius: '4px',
                            },
                            '::-webkit-scrollbar-thumb:hover': {
                                backgroundColor: '#555',
                            },
                            '::-webkit-scrollbar-track': {
                                backgroundColor: '#f1f1f1',
                                borderRadius: '4px',
                            }
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
                    )}

                    {(focused && !searchingFocus) && (
                        <Box sx={{
                            position: 'absolute',
                            top: '25%',
                            width: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexDirection: 'row' }}>
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
                    )}
                </>
            ) : (
                // Checkbox options screen
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: '10px'
                }}>
                    <Typography variant="h6">Select Services</Typography>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr', // Two columns
                        gap: 1,
                    }}>
                        {categories.map((category) => (
                            <FormControlLabel
                                key={category}
                                control={
                                    <Checkbox
                                        checked={selectedOptions.includes(category)}
                                        onChange={() => handleOptionChange(category)}
                                    />
                                }
                                label={category}
                            />
                        ))}
                    </Box>
                        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSearchOptions}>
                        Search
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default BottomBar;
