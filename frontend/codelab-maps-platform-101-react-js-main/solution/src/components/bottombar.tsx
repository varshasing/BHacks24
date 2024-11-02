import React, { useState, ChangeEvent } from 'react';
import { Box, TextField, List, ListItem, ListItemText } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Slider, Typography } from '@mui/material';

interface SearchResult {
    displayName: string;
    latitude: string;
    longitude: string;
    address: Record<string, string>;
}

async function searchOpenStreetMap(query: string): Promise<SearchResult[]> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

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

const BottomBar: React.FC = () => {
    const [focused, setFocused] = useState<boolean>(false);
    const [searchingFocus, setSearchingFocus] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<SearchResult | null>(null);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [radius, setRadius] = useState<number>(10);

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

    const handleLocationSelect = (result: SearchResult) => {
        console.log("CLICKITY CLICK");
        setSelectedLocation(result);
        setResults([]); // Clear search results after selection
        console.log("Selected Location:", result);
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
                paddingBottom: focused ? (searchingFocus ? '140%' : '40%') : '10px',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '30px',
                transition: 'padding-bottom 0.3s ease',
                zIndex: 1,
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            tabIndex={-1}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    backgroundColor: '#f1f1f1',
                    borderRadius: '20px',
                    px: 2,
                }}
            >
                <SearchIcon sx={{ color: 'grey.600', mr: 1 }} />
                <TextField
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
                    onBlur={() => setSearchingFocus(false)}
                />
            </Box>

            {searchingFocus && results.length > 0 && (
                <List
                    sx={{
                        position: 'absolute',
                        top: '50px',
                        width: '80%',
                        bottom: '50%',
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
                    }}
                >
                    {results.map((result, index) => (
                        <ListItem key={index} component="div" onClick={() => handleLocationSelect(result)}>
                            <ListItemText
                                primary={result.displayName}
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            {(focused && !searchingFocus) && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '55%',
                        width: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography gutterBottom>Select a Distance:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
                </Box>
            )}
        </Box>
    );
};

export default BottomBar;
