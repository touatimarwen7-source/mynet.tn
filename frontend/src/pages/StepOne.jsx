import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid,
  Paper,
} from '@mui/material';

function StepOne() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
      <Typography variant="h5" gutterBottom>
        Step 1: Your Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="State/Province"
            name="state"
            value={formData.state}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Zip/Postal Code"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Country</InputLabel>
            <Select
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            >
              <MenuItem value="USA">USA</MenuItem>
              <MenuItem value="Canada">Canada</MenuItem>
              <MenuItem value="Mexico">Mexico</MenuItem>
              {/* Add more countries as needed */}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default StepOne;