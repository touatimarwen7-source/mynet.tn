// Supplier Performance Tracking - TURN 3 ENHANCEMENT
import React, { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Box, Card, Grid, Typography, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import axios from 'axios';

const SupplierPerformancePage = () => {
  const theme = institutionalTheme;
  const [topSuppliers, setTopSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopSuppliers();
  }, []);

  const fetchTopSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/performance-tracking/top-suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopSuppliers(res.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>⭐ Supplier Performance Tracking</Typography>

      <TableContainer component={Card}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Company</TableCell>
              <TableCell sx={{ color: '#fff' }}>Rating</TableCell>
              <TableCell sx={{ color: '#fff' }}>Total Offers</TableCell>
              <TableCell sx={{ color: '#fff' }}>Reviews</TableCell>
              <TableCell sx={{ color: '#fff' }}>Verified</TableCell>
              <TableCell sx={{ color: '#fff' }}>Performance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.company_name}</TableCell>
                <TableCell>{supplier.average_rating.toFixed(1)}/5</TableCell>
                <TableCell>{supplier.total_offers}</TableCell>
                <TableCell>{supplier.review_count}</TableCell>
                <TableCell>{supplier.verified ? '✅' : '❌'}</TableCell>
                <TableCell>
                  <LinearProgress 
                    variant="determinate" 
                    value={supplier.average_rating * 20} 
                    sx={{ width: '100px' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SupplierPerformancePage;
