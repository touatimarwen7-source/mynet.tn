import { useState, useEffect, useMemo } from 'react';
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
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import CompareIcon from '@mui/icons-material/Compare';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { procurementAPI } from '../api';
import { formatDate, parseDate } from '../utils/dateFormatter';
import { setPageTitle } from '../utils/pageTitle';
import { logger } from '../utils/logger';
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
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState({ min: '', max: '' });
  const [statistics, setStatistics] = useState({ total: 0, avgOffers: 0, totalBudget: 0 });

  useEffect(() => {
    setPageTitle("Appels d'Offres Actifs");
  }, []);

  useEffect(() => {
    fetchActiveTenders();
  }, []);

  const fetchActiveTenders = async () => {
    try {
      setLoading(true);
      const response = await procurementAPI.getMyTenders();
      
      // التحقق من البيانات المستلمة
      if (response?.data?.tenders && Array.isArray(response.data.tenders)) {
        // تصفية المناقصات النشطة فقط (open, published)
        const activeTenders = response.data.tenders.filter(
          tender => tender.status === 'open' || tender.status === 'published'
        );
        setTenders(activeTenders);
        
        // حساب الإحصائيات
        const stats = {
          total: activeTenders.length,
          avgOffers: activeTenders.reduce((acc, t) => acc + (t.offers_count || 0), 0) / (activeTenders.length || 1),
          totalBudget: activeTenders.reduce((acc, t) => acc + (t.budget_max || 0), 0),
        };
        setStatistics(stats);
      } else {
        logger.warn('استجابة غير متوقعة من API:', response);
        setTenders([]);
      }
    } catch (err) {
      logger.error('Failed to fetch active tenders:', err);
      setTenders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      // البحث النصي
      const matchesSearch = 
        t.title.toLowerCase().includes(filter.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(filter.toLowerCase()));
      
      // فلتر الفئة
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      
      // فلتر الميزانية
      const matchesBudget = 
        (!budgetFilter.min || t.budget_max >= parseFloat(budgetFilter.min)) &&
        (!budgetFilter.max || t.budget_max <= parseFloat(budgetFilter.max));
      
      return matchesSearch && matchesCategory && matchesBudget;
    });
  }, [tenders, filter, categoryFilter, budgetFilter]);

  const sortedTenders = [...filteredTenders].sort((a, b) => {
    if (sortBy === 'created_at') return parseDate(b.created_at) - parseDate(a.created_at);
    if (sortBy === 'deadline') return parseDate(a.deadline) - parseDate(b.deadline);
    if (sortBy === 'budget') return (b.budget_max || 0) - (a.budget_max || 0);
    return 0;
  });

  const handleConfirmAction = async () => {
    const { action, tenderId } = confirmDialog;
    if (!action || !tenderId) {
      setConfirmDialog({ ...confirmDialog, open: false });
      return;
    }

    try {
      if (action === 'close') {
        await procurementAPI.closeTender(tenderId);
      }
      fetchActiveTenders();
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err) {
      logger.error(`Failed to ${action} tender ${tenderId}:`, err);
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const totalPages = Math.ceil(sortedTenders.length / pageSize);
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedTenders = sortedTenders.slice(startIdx, startIdx + pageSize);

  const handleCloseTender = (tenderId) => {
    setConfirmDialog({
      open: true,
      action: 'close',
      tenderId,
      title: "Clôturer l'appel d'offres",
      message:
        "Êtes-vous sûr de vouloir clôturer cet appel d'offres ? Cette action ne peut pas être annulée.",
    });
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
      setSelectedTenders(new Set(paginatedTenders.map((t) => t.id)));
    } else {
      setSelectedTenders(new Set());
    }
  };

  const calculateProgress = (tender) => {
    const now = new Date();
    const created = parseDate(tender.created_at);
    const deadline = parseDate(tender.deadline);
    
    if (!deadline || deadline <= created) return 0;
    
    const total = deadline - created;
    const elapsed = now - created;
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    
    return Math.round(progress);
  };

  const getDaysRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = parseDate(deadline);
    const diff = deadlineDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleExport = (format) => {
    const dataToExport =
      selectedTenders.size > 0 ? tenders.filter((t) => selectedTenders.has(t.id)) : tenders;

    const exportData = prepareDataForExport(dataToExport, [
      { label: 'ID', key: 'id' },
      { label: 'Titre', key: 'title' },
      { label: 'Description', key: 'description' },
      { label: 'Catégorie', key: 'category' },
      { label: 'Budget', key: 'budget_max' },
      { label: 'Devise', key: 'currency' },
      { label: 'Date limite', key: 'deadline' },
      { label: 'Offres reçues', key: 'offers_count' },
    ]);

    if (format === 'json') {
      exportToJSON(exportData, `appels-offres-${new Date().toISOString().split('T')[0]}.json`);
    } else {
      exportToCSV(exportData, `appels-offres-${new Date().toISOString().split('T')[0]}.csv`);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
      >
        <CircularProgress sx={{ color: institutionalTheme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: '32px',
                fontWeight: 500,
                color: institutionalTheme.palette.text.primary,
                marginBottom: '8px',
              }}
            >
              📋 Appels d'Offres Actifs
            </Typography>
            <Typography sx={{ color: '#616161' }}>Gérez vos appels d'offres en cours</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton onClick={fetchActiveTenders} sx={{ color: institutionalTheme.palette.primary.main }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-tender')}
              sx={{
                backgroundColor: institutionalTheme.palette.primary.main,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#0d47a1' },
              }}
            >
              Créer Appel
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={2} sx={{ marginBottom: '24px' }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '8px' }}>
                  Total des Appels
                </Typography>
                <Typography sx={{ fontSize: '28px', fontWeight: 600, color: institutionalTheme.palette.primary.main }}>
                  {statistics.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon sx={{ color: '#4caf50' }} />
                  <Box>
                    <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '8px' }}>
                      Moyenne des Offres
                    </Typography>
                    <Typography sx={{ fontSize: '28px', fontWeight: 600, color: '#4caf50' }}>
                      {statistics.avgOffers.toFixed(1)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '8px' }}>
                  Budget Total
                </Typography>
                <Typography sx={{ fontSize: '28px', fontWeight: 600, color: institutionalTheme.palette.primary.main }}>
                  {statistics.totalBudget.toLocaleString()} TND
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par titre ou description..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  variant="outlined"
                  inputProps={{ 'aria-label': "Rechercher dans les appels d'offres" }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{
                    minWidth: '140px',
                    textTransform: 'none',
                    borderColor: institutionalTheme.palette.primary.main,
                    color: institutionalTheme.palette.primary.main,
                  }}
                >
                  Filtres
                </Button>
              </Box>

              {showFilters && (
                <>
                  <Divider />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Catégorie</InputLabel>
                        <Select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          label="Catégorie"
                        >
                          <MenuItem value="all">Toutes les catégories</MenuItem>
                          <MenuItem value="technology">Technologie</MenuItem>
                          <MenuItem value="construction">Construction</MenuItem>
                          <MenuItem value="services">Services</MenuItem>
                          <MenuItem value="supplies">Fournitures</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Budget Min (TND)"
                        value={budgetFilter.min}
                        onChange={(e) => setBudgetFilter({ ...budgetFilter, min: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Budget Max (TND)"
                        value={budgetFilter.max}
                        onChange={(e) => setBudgetFilter({ ...budgetFilter, max: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              <FormControl fullWidth>
                <InputLabel id="sort-label">Trier par</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Trier par"
                  inputProps={{ 'aria-label': "Trier les appels d'offres par" }}
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
          <Alert
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#0d47a1',
              border: '1px solid #0056B3',
              marginBottom: '16px',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '13px' }}>
                {selectedTenders.size} appel(s) sélectionné(s)
              </Typography>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('json')}
                  sx={{ textTransform: 'none', color: institutionalTheme.palette.primary.main }}
                >
                  JSON
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('csv')}
                  sx={{ textTransform: 'none', color: institutionalTheme.palette.primary.main }}
                >
                  CSV
                </Button>
              </Box>
            </Box>
          </Alert>
        )}

        {sortedTenders.length === 0 ? (
          <Alert
            severity="info"
            sx={{ backgroundColor: '#e3f2fd', color: '#0d47a1', border: '1px solid #0056B3' }}
          >
            Aucun appel d'offres actif. Créez votre premier appel maintenant!
          </Alert>
        ) : (
          <>
            <Box sx={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Checkbox
                checked={
                  selectedTenders.size === paginatedTenders.length && paginatedTenders.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                sx={{ '& svg': { fontSize: '20px' } }}
              />
              <Typography sx={{ fontSize: '13px', color: '#666' }}>
                Sélectionner tous les éléments de la page
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {paginatedTenders.map((tender) => (
                <Grid item xs={12} md={6} key={tender.id}>
                  <Card
                    sx={{
                      border: '1px solid #e0e0e0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ position: 'absolute', top: '12px', left: '12px', zIndex: 1 }}>
                      <Checkbox
                        checked={selectedTenders.has(tender.id)}
                        onChange={(e) => handleSelectTender(tender.id, e.target.checked)}
                        sx={{ '& svg': { fontSize: '20px' } }}
                      />
                    </Box>
                    <CardContent sx={{ padding: '24px', flex: 1, paddingLeft: '52px' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px',
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontSize: '18px',
                            fontWeight: 600,
                            color: institutionalTheme.palette.text.primary,
                            flex: 1,
                          }}
                        >
                          {tender.title}
                        </Typography>
                        <StatusBadge status="active" />
                      </Box>

                      <Typography sx={{ color: '#616161', marginBottom: '16px', fontSize: '14px' }}>
                        {tender.description?.substring(0, 100)}...
                      </Typography>

                      <Stack spacing={2} sx={{ marginBottom: '16px' }}>
                        <Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>
                            Catégorie
                          </Typography>
                          <Chip 
                            label={tender.category} 
                            size="small" 
                            sx={{ 
                              backgroundColor: '#e3f2fd',
                              color: institutionalTheme.palette.primary.main,
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}>
                            Budget
                          </Typography>
                          <Typography
                            sx={{ color: institutionalTheme.palette.primary.main, fontWeight: 600 }}
                          >
                            {tender.budget_max?.toLocaleString()} {tender.currency}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', marginBottom: '4px' }}>
                            Date limite
                          </Typography>
                          <Typography sx={{ color: institutionalTheme.palette.text.primary, marginBottom: '8px' }}>
                            {formatDate(tender.deadline)}
                          </Typography>
                          {tender.deadline && (
                            <>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, marginBottom: '8px' }}>
                                <Typography sx={{ fontSize: '12px', color: '#f57c00', fontWeight: 600 }}>
                                  {getDaysRemaining(tender.deadline)} jours restants
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={calculateProgress(tender)}
                                sx={{
                                  height: '6px',
                                  borderRadius: '3px',
                                  backgroundColor: '#e0e0e0',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: calculateProgress(tender) > 80 ? '#f44336' : 
                                                    calculateProgress(tender) > 50 ? '#ff9800' : 
                                                    '#4caf50',
                                  },
                                }}
                              />
                            </>
                          )}
                        </Box>
                        {tender.offers_count !== undefined && (
                          <Box>
                            <Typography
                              sx={{ fontSize: '12px', fontWeight: 600, color: '#616161' }}
                            >
                              Offres reçues
                            </Typography>
                            <Typography
                              sx={{
                                color: institutionalTheme.palette.primary.main,
                                fontWeight: 600,
                                fontSize: '18px',
                              }}
                            >
                              📊 {tender.offers_count}
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>

                    <Box
                      sx={{
                        padding: '16px 24px',
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/tender/${tender.id}`)}
                        sx={{
                          flex: 1,
                          minWidth: '80px',
                          backgroundColor: institutionalTheme.palette.primary.main,
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
                        sx={{
                          flex: 1,
                          minWidth: '80px',
                          color: institutionalTheme.palette.primary.main,
                          borderColor: institutionalTheme.palette.primary.main,
                          textTransform: 'none',
                        }}
                      >
                        Comparer
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/tender/${tender.id}/edit`)}
                        sx={{
                          flex: 1,
                          minWidth: '80px',
                          color: institutionalTheme.palette.primary.main,
                          borderColor: institutionalTheme.palette.primary.main,
                          textTransform: 'none',
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<LockIcon />}
                        onClick={() => handleCloseTender(tender.id)}
                        sx={{
                          flex: 1,
                          minWidth: '80px',
                          color: '#f57c00',
                          borderColor: '#f57c00',
                          textTransform: 'none',
                        }}
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
