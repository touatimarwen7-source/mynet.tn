// Advanced Search Page - TURN 3 ENHANCEMENT
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, Card, Typography, Slider, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const AdvancedSearchPage = () => {
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    minBudget: 0,
    maxBudget: 1000000,
    category: '',
    location: '',
    minRating: 0
  });

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/search/advanced/tenders/advanced', {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>🔍 Advanced Search</Typography>

      {/* Filters */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Select
              fullWidth
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              displayEmpty
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Technology">Technology</MenuItem>
              <MenuItem value="Services">Services</MenuItem>
              <MenuItem value="Products">Products</MenuItem>
            </Select>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Budget Range"
              type="number"
              value={filters.minBudget}
              onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography>Minimum Rating: {filters.minRating}</Typography>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={filters.minRating}
              onChange={(e, newValue) => setFilters({ ...filters, minRating: newValue })}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" onClick={handleSearch} fullWidth>
              Search
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Results */}
      <Grid container spacing={2}>
        {results.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="body2">Budget: ${item.budget}</Typography>
              <Typography variant="body2">Rating: {item.average_rating}/5</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdvancedSearchPage;
