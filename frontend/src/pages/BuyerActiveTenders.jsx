import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
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
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import CompareIcon from '@mui/icons-material/Compare';
import DownloadIcon from '@mui/icons-material/Download';
import { procurementAPI } from '../api';
import { formatDate, parseDate } from '../utils/dateFormatter';
import { setPageTitle } from '../utils/pageTitle';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { exportToJSON, exportToCSV, prepareDataForExport } from '../utils/exportUtils';

export default function BuyerActiveTenders() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, tenderId: null });
  const [selectedTenders, setSelectedTenders] = useState(new Set());

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

  const totalPages = Math.ceil(sortedTenders.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedTenders = sortedTenders.slice(startIdx, startIdx + pageSize);

  const handleCloseTender = (tenderId) => {
    setConfirmDialog({
      open: true,
      action: 'close',
      tenderId,
      title: 'Clôturer l\'appel d\'offres',
      message: 'Êtes-vous sûr de vouloir clôturer cet appel d\'offres ? Cette action ne peut pas être annulée.'
    });
  };

  const handleConfirmAction = async () => {
    const { action, tenderId } = confirmDialog;
    try {
      if (action === 'close') {
        await procurementAPI.closeTender(tenderId);
      }
      fetchActiveTenders();
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err) {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleSelectTender = (tenderId, isSelected) => {
    const newSelected = new Set(selectedTenders);
    if (isSelected) {
      newSelected.add(tenderId);
    } else {
      newSelected.delete(tenderId);
    }
    setSelectedTenders(newSelected);
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      setSelectedTenders(new Set(paginatedTenders.map(t => t.id)));
    } else {
      setSelectedTenders(new Set());
    }
  };

  const handleExport = (format) => {
    const dataToExport = selectedTenders.size > 0
      ? tenders.filter(t => selectedTenders.has(t.id))
      : tenders;

    const exportData = prepareDataForExport(dataToExport, [
      { label: 'ID', key: 'id' },
      { label: 'Titre', key: 'title' },
      { label: 'Description', key: 'description' },
      { label: 'Catégorie', key: 'category' },
      { label: 'Budget', key: 'budget_max' },
      { label: 'Devise', key: 'currency' },
      { label: 'Date limite', key: 'deadline' },
      { label: 'Offres reçues', key: 'offers_count' }
    ]);

    if (format === 'json') {
      exportToJSON(exportData, `appels-offres-${new Date().toISOString().split('T')[0]}.json`);
    } else {
      exportToCSV(exportData, `appels-offres-${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '8px' }}>
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
              backgroundColor: theme.palette.primary.main,
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
                inputProps={{ 'aria-label': 'Rechercher dans les appels d\'offres' }}
                aria-describedby="search-help"
              />
              <Typography id="search-help" sx={{ fontSize: '12px', color: '#999' }}>
                Tapez au moins 2 caractères pour rechercher
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="sort-label">Trier par</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Trier par"
                  inputProps={{ 'aria-label': 'Trier les appels d\'offres par' }}
                >
                  <MenuItem value="created_at">Date de création (récent)</MenuItem>
                  <MenuItem value="deadline">Date limite (urgent)</MenuItem>
                  <MenuItem value="budget">Budget (élevé)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        {selectedTenders.size > 0 && (
          <Alert sx={{ backgroundColor: '#e3f2fd', color: '#0d47a1', border: '1px solid #0056B3', marginBottom: '16px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '13px' }}>
                {selectedTenders.size} appel(s) sélectionné(s)
              </Typography>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('json')}
                  sx={{ textTransform: 'none', color: theme.palette.primary.main }}
                >
                  JSON
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('csv')}
                  sx={{ textTransform: 'none', color: theme.palette.primary.main }}
                >
                  CSV
                </Button>
              </Box>
            </Box>
          </Alert>
        )}

        {sortedTenders.length === 0 ? (
          <Alert severity="info" sx={{ backgroundColor: '#e3f2fd', color: '#0d47a1', border: '1px solid #0056B3' }}>
            Aucun appel d'offres actif. Créez votre premier appel maintenant!
          </Alert>
        ) : (
          <>
            <Box sx={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Checkbox
                checked={selectedTenders.size === paginatedTenders.length && paginatedTenders.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                sx={{ '& svg': { fontSize: '20px' } }}
              />
              <Typography sx={{ fontSize: '13px', color: '#666' }}>
                Sélectionner tous les éléments de la page
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {paginatedTenders.map((tender) => (
              <Grid size={{ xs: 12, md: 6 }} key={tender.id}>
                <Card sx={{ border: '1px solid #e0e0e0', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1 }}>
                    <Checkbox
                      checked={selectedTenders.has(tender.id)}
                      onChange={(e) => handleSelectTender(tender.id, e.target.checked)}
                      sx={{ '& svg': { fontSize: '20px' } }}
                    />
                  </Box>
                  <CardContent sx={{ padding: '24px', flex: 1, paddingLeft: '52px' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: theme.palette.text.primary, flex: 1 }}>
                        {tender.title}
                      </Typography>
                      <StatusBadge status="active" />
                    </Box>

                    <Typography sx={{ color: '#616161', marginBottom: '16px', fontSize: '14px' }}>
                      {tender.description?.substring(0, 100)}...
                    </Typography>

                    <Stack spacing={2} sx={{ marginBottom: '16px' }}>
                      <Box>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>Catégorie</Typography>
                        <Typography sx={{ color: theme.palette.text.primary }}>{tender.category}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>Budget</Typography>
                        <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                          {tender.budget_max?.toLocaleString()} {tender.currency}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>Date limite</Typography>
                        <Typography sx={{ color: theme.palette.text.primary }}>{formatDate(tender.deadline)}</Typography>
                      </Box>
                      {tender.offers_count && (
                        <Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>Offres reçues</Typography>
                          <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>📊 {tender.offers_count}</Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>

                  <Box sx={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/tender/${tender.id}`)}
                      sx={{
                        flex: 1,
                        minWidth: '80px',
                        backgroundColor: theme.palette.primary.main,
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#0d47a1' },
                      }}
                    >
                      Voir
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<CompareIcon />}
                      onClick={() => navigate(`/bid-comparison/${tender.id}`)}
                      sx={{ flex: 1, minWidth: '80px', color: theme.palette.primary.main, borderColor: theme.palette.primary.main, textTransform: 'none' }}
                    >
                      Comparer
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/tender/${tender.id}/edit`)}
                      sx={{ flex: 1, minWidth: '80px', color: theme.palette.primary.main, borderColor: theme.palette.primary.main, textTransform: 'none' }}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<LockIcon />}
                      onClick={() => handleCloseTender(tender.id)}
                      sx={{ flex: 1, minWidth: '80px', color: '#f57c00', borderColor: '#f57c00', textTransform: 'none' }}
                    >
                      Clôturer
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
            </Grid>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={sortedTenders.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}

        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
          severity="warning"
        />
      </Container>
    </Box>
  );
}
