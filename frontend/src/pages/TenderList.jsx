import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { procurementAPI } from '../api';
import { formatDate } from '../utils/dateFormatter';
import { setPageTitle } from '../utils/pageTitle';

export default function TenderList() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setPageTitle('Appels d\'Offres');
  }, []);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const response = await procurementAPI.getTenders();
      setTenders(response.data.tenders || []);
    } catch (err) {
      console.error('Erreur lors de la récupération des appels d\'offres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = (tenderId) => {
    navigate(`/create-offer/${tenderId}`);
  };

  const filteredTenders = tenders.filter(t =>
    t.title?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#1565c0' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          sx={{
            fontSize: '32px',
            fontWeight: 500,
            color: '#212121',
            marginBottom: '32px',
          }}
        >
          Appels d'Offres
        </Typography>

        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Filtrer par titre..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#ffffff',
                },
              }}
            />
          </CardContent>
        </Card>

        {filteredTenders.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#0d47a1',
              border: '1px solid #1565c0',
              borderRadius: '4px',
            }}
          >
            {filter ? 'Aucun appel d\'offres ne correspond à votre recherche' : 'Aucun appel d\'offres disponible'}
          </Alert>
        ) : (
          <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow sx={{ height: '56px' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }}>
                    Titre
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }}>
                    Entreprise
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }} align="right">
                    Budget
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }}>
                    Date limite
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }}>
                    Statut
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1565c0', textTransform: 'uppercase', fontSize: '12px' }} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTenders.map((tender) => (
                  <TableRow
                    key={tender.id}
                    sx={{
                      height: '56px',
                      borderBottom: '1px solid #e0e0e0',
                      '&:hover': { backgroundColor: '#fafafa' },
                    }}
                  >
                    <TableCell sx={{ color: '#212121', fontSize: '14px', fontWeight: 500 }}>
                      {tender.title}
                    </TableCell>
                    <TableCell sx={{ color: '#616161', fontSize: '14px' }}>
                      {tender.buyer_name || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: '#212121', fontSize: '14px', fontWeight: 500 }} align="right">
                      {tender.budget_min ? `${tender.budget_min.toLocaleString()} TND` : 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: '#616161', fontSize: '14px' }}>
                      {formatDate(tender.deadline)}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          backgroundColor:
                            tender.status === 'active' ? '#e8f5e9' :
                            tender.status === 'closed' ? '#ffebee' : '#e3f2fd',
                          color:
                            tender.status === 'active' ? '#1b5e20' :
                            tender.status === 'closed' ? '#c62828' : '#0d47a1',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {tender.status === 'active' ? 'Actif' : tender.status === 'closed' ? 'Clôturé' : 'Brouillon'}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleParticipate(tender.id)}
                        sx={{
                          backgroundColor: '#1565c0',
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '12px',
                          minHeight: '36px',
                          '&:hover': { backgroundColor: '#0d47a1' },
                        }}
                      >
                        Participer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
