// components/AddLocationForm.tsx
import React, { useState } from 'react';
import { Poi } from '../app';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
  Typography,
  FormHelperText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const categories = [
  "Education",
  "Legal",
  "Housing/Shelter",
  "Healthcare",
  "Food",
  "Employment",
  "Community Education",
  "Cash Assistance",
  "Mental Health Services",
  "Case Management",
];

const addLocationAPICall = async (poiData: Poi) => {
  // Transform Poi data to match the API schema
  const apiData = {
    name: poiData.name,
    addr: poiData.address,
    hours: poiData.hours,
    languages: poiData.languages,
    website: poiData.website,
    phone: poiData.phone,
    notes: poiData.summary, // Assuming 'notes' corresponds to 'summary'
    services: poiData.services,
    coordinates: [
      poiData.location.lat.toString(),
      poiData.location.lng.toString()
    ]
  };

  try {
    const response = await fetch("http://127.0.0.1:8000/locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiData)
    });

    if (!response.ok) {
      throw new Error(`Failed to add location: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Location added successfully:", result);
    return result;
  } catch (error) {
    console.error("Error adding location:", error);
    throw error;
  }
};



interface AddLocationFormProps {
  open: boolean; // Controls form visibility
  onClose: () => void; // Callback to close the form
  center: google.maps.LatLngLiteral | null; // Center of the map
  onSubmit: (formData: any) => void; // Replace `any` with a specific type if you have one
  setLocationPins: React.Dispatch<React.SetStateAction<Poi[]>>;
}

const AddLocationForm: React.FC<AddLocationFormProps> = ({ open, onClose, center, onSubmit, setLocationPins }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    hours: '',
    demographics: '',
    languages: '',
    website: '',
    phone: '',
    summary: '',
    services: categories.reduce((acc, category) => ({ ...acc, [category]: false }), {}),
  });

  const [serviceError, setServiceError] = useState(false); // Tracks if there’s a service selection error

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      services: { ...prevData.services, [name]: checked },
    }));
    setServiceError(false); // Reset error when a service type is selected/deselected
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Check if at least one service type is selected
    const isAnyServiceSelected = Object.values(formData.services).some(value => value === true);
    if (!isAnyServiceSelected || !center) {
      setServiceError(true);
      return;
    }

    // Convert data to POI format
    const poiData : Poi = {
      location: { lat: center.lat, lng: center.lng },
      name: formData.name,
      services: Object.entries(formData.services)
        .filter(([_, value]) => value)
        .map(([key]) => key),
      languages: formData.languages.split(',').map(lang => lang.trim()),
      phone: formData.phone,
      address: formData.address,
      website: formData.website,
      demographics: formData.demographics,
      summary: formData.summary,
      hours: formData.hours,
    };
    // call api on POI data
    addLocationAPICall(poiData);
    // add new location to the map?
    setLocationPins(prevPins => [...prevPins, poiData]);

    onSubmit(formData);
    onClose(); // Close the form after submission
  };

  if (!open) return null; // Do not render the form if `open` is false

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2000,
        backgroundColor: '#ffffff',
        color: '#000000',
        overflowY: 'auto',
        p: { xs: 2, sm: 3 },
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
        <IconButton onClick={onClose} aria-label="close" color="primary">
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="h5" color="primary" align="center" sx={{ mb: 2, fontSize: { xs: '1.2em', sm: '1.5em' } }}>
        Add New Location
      </Typography>

      <Box sx={{ maxWidth: { xs: '100%', sm: '600px' }, width: '100%', boxSizing: 'border-box' }}>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Hours"
          name="hours"
          value={formData.hours}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Languages"
          name="languages"
          value={formData.languages}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Website"
          name="website"
          value={formData.website}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Notes"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
          sx={{ mb: 0 }}
        />

        <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }} error={serviceError}>
          <Typography variant="subtitle1" gutterBottom>
            Service Type
          </Typography>
          <FormGroup row>
            {categories.map((category) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.services[category]}
                    onChange={handleServiceChange}
                    name={category}
                  />
                }
                label={category}
                key={category}
                sx={{ width: { xs: '50%', sm: 'auto' }, mb: 1 }}
              />
            ))}
          </FormGroup>
          {serviceError && (
            <FormHelperText>Please select at least one service type.</FormHelperText>
          )}
        </FormControl>

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default AddLocationForm;
