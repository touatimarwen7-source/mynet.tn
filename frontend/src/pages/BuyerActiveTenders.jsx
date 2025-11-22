import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import { procurementAPI } from '../api';
import { formatDate, parseDate } from '../utils/dateFormatter';
import { setPageTitle } from '../utils/pageTitle';

export default function BuyerActiveTenders() {
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    setPageTitle('Appels d\'Offres Actifs');
  }, []);

  useEffect(() => {
    fetchActiveTenders();
  }, []);

  const fetchActiveTenders = async () => {
    try {
      setLoading(true);
      const response = await procurementAPI.getMyTenders({ status: 'active' });
      setTenders(response.data.tenders || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenders = tenders.filter(t =>
    t.title.toLowerCase().includes(filter.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(filter.toLowerCase()))
  );

  const sortedTenders = [...filteredTenders].sort((a, b) => {
    if (sortBy === 'created_at') return parseDate(b.created_at) - parseDate(a.created_at);
    if (sortBy === 'deadline') return parseDate(a.deadline) - parseDate(b.deadline);
    if (sortBy === 'budget') return (b.budget_max || 0) - (a.budget_max || 0);
    return 0;
  });

  const handleCloseTender = async (tenderId) => {
    if (window.confirm('Êtes-vous sûr de vouloir clôturer cet appel d\'offres ?')) {
      try {
        await procurementAPI.closeTender(tenderId);
        fetchActiveTenders();
      } catch (err) {
        console.error('Erreur:', err);
      }
    }
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: '#212121', marginBottom: '8px' }}>
              📋 Appels d'Offres Actifs
            </Typography>
            <Typography sx={{ color: '#616161' }}>
              Gérez vos appels d'offres en cours
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-tender')}
            sx={{
              backgroundColor: '#1565c0',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#0d47a1' },
            }}
          >
            Créer Appel
          </Button>
        </Box>

        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Rechercher par titre ou description..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                variant="outlined"
              />
              <FormControl fullWidth>
                <InputLabel>Trier par</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Trier par"
                >
                  <MenuItem value="created_at">Date de création (récent)</MenuItem>
                  <MenuItem value="deadline">Date limite (urgent)</MenuItem>
                  <MenuItem value="budget">Budget (élevé)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {sortedTenders.length === 0 ? (
          <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#0d47a1', border: '1px solid #1565c0' }}>
            Aucun appel d'offres actif. Créez votre premier appel maintenant!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {sortedTenders.map((tender) => (
              <Grid size={{ xs: 12, md: 6 }} key={tender.id}>
                <Card sx={{ border: '1px solid #e0e0e0', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ padding: '24px', flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', flex: 1 }}>
                        {tender.title}
                      </Typography>
                      <Chip label="Actif" sx={{ backgroundColor: '#e8f5e9', color: '#1b5e20' }} />
                    </Box>

                    <Typography sx={{ color: '#616161', marginBottom: '16px', fontSize: '14px' }}>
                      {tender.description?.substring(0, 100)}...
                    </Typography>

                    <Stack spacing={2} sx={{ marginBottom: '16px' }}>
                      <Box>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>Catégorie</Typography>
                        <Typography sx={{ color: '#212121' }}>{tender.category}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>Budget</Typography>
                        <Typography sx={{ color: '#1565c0', fontWeight: 600 }}>
                          {tender.budget_max?.toLocaleString()} {tender.currency}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>Date limite</Typography>
                        <Typography sx={{ color: '#212121' }}>{formatDate(tender.deadline)}</Typography>
                      </Box>
                      {tender.offers_count && (
                        <Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>Offres reçues</Typography>
                          <Typography sx={{ color: '#1565c0', fontWeight: 600 }}>📊 {tender.offers_count}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>

                  <Box sx={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '8px' }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/tender/${tender.id}`)}
                      sx={{
                        flex: 1,
                        backgroundColor: '#1565c0',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#0d47a1' },
                      }}
                    >
                      Voir
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/tender/${tender.id}/edit`)}
                      sx={{ flex: 1, color: '#1565c0', borderColor: '#1565c0', textTransform: 'none' }}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => handleCloseTender(tender.id)}
                      sx={{ flex: 1, color: '#f57c00', borderColor: '#f57c00', textTransform: 'none' }}
                    >
                      Clôturer
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
