// Analytics Dashboard - TURN 3 ENHANCEMENT
import React, { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Box, Card, Grid, Typography, CircularProgress } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const theme = institutionalTheme;
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');

      const endpoint = role === 'supplier' 
        ? '/api/analytics/dashboard/supplier'
        : '/api/analytics/dashboard/buyer';

      const [statsRes, trendsRes, distRes] = await Promise.all([
        axios.get(endpoint, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/analytics/trends/tenders', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/analytics/distribution/offers', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats(statsRes.data);
      setTrends(trendsRes.data);
      setDistribution(distRes.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  const COLORS = [institutionalTheme.palette.primary.main, '#00D4FF', '#FF6B6B', '#4ECDC4'];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>📊 Dashboard Analytics</Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats && Object.entries(stats).map(([key, value]) => (
          <Grid xs={12} sm={6} md={3} key={key}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                {key.replace(/_/g, ' ').toUpperCase()}
              </Typography>
              <Typography variant="h5" sx={{ color: institutionalTheme.palette.primary.main, fontWeight: 'bold' }}>
                {typeof value === 'number' ? value.toFixed(2) : value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Trends Chart */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>📈 Tender Trends (30 days)</Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke=institutionalTheme.palette.primary.main strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Distribution Chart */}
      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Offer Status Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={distribution} cx="50%" cy="50%" labelLine={false} label dataKey="count">
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Status Breakdown</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill=institutionalTheme.palette.primary.main />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
