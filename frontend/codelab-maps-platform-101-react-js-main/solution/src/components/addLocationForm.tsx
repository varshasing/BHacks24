// components/AddLocationForm.tsx
import React, { useState } from 'react';
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

interface AddLocationFormProps {
  open: boolean; // Controls form visibility
  onClose: () => void; // Callback to close the form
  onSubmit: (formData: any) => void; // Replace `any` with a specific type if you have one
}

const AddLocationForm: React.FC<AddLocationFormProps> = ({ open, onClose, onSubmit }) => {
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
    if (!isAnyServiceSelected) {
      setServiceError(true);
      return;
    }

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
