import React, { useState, useEffect } from 'react';
import { procurementAPI } from '../api/procurementAPI';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Chip,
} from '@mui/material';

/**
 * A component that displays the audit log (history of events) for a tender.
 * @param {{ tenderId: string }} props
 */
const TenderAuditLog = ({ tenderId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!tenderId) return;
      setLoading(true);
      try {
        const response = await procurementAPI.getTenderHistory(tenderId);
        setHistory(response.data.history || []);
      } catch (err) {
        setError('Erreur lors du chargement de l\'historique.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [tenderId]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Historique des Événements
      </Typography>
      <Stack spacing={2}>
        {history.length > 0 ? history.map((entry) => (
          <Paper key={entry.id} variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {new Date(entry.timestamp).toLocaleString('fr-FR')} - {entry.user.name} ({entry.user.role})
            </Typography>
            <Typography variant="body1"><strong>{entry.action}</strong></Typography>
          </Paper>
        )) : <Typography>Aucun événement à afficher.</Typography>}
      </Stack>
    </Box>
  );
};

export default TenderAuditLog;