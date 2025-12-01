import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { setPageTitle } from '../utils/pageTitle';
import api from '../services/api';
import { useFetchData } from '../hooks/useFetchData';
import institutionalTheme from '../theme/theme';

const TenderStatusChip = ({ status }) => {
  const statusStyles = {
    published: { label: 'Publié', color: 'success' },
    draft: { label: 'Brouillon', color: 'warning' },
    closed: { label: 'Fermé', color: 'default' },
    awarded: { label: 'Attribué', color: 'primary' },
  };

  const style = statusStyles[status] || { label: status, color: 'default' };

  return <Chip label={style.label} color={style.color} size="small" />;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ استخدام الخطاف المخصص لجلب البيانات
  const { data: tenderData, loading, error } = useFetchData('/procurement/tenders');
  const tenders = tenderData?.tenders || [];

  useEffect(() => {
    setPageTitle('Tableau de Bord');
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (tenderId) => {
    navigate(`/tender/${tenderId}`);
  };

  const paginatedTenders = tenders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h1" sx={{ ...institutionalTheme.typography.h1 }}>
            Tableau de Bord des Appels d'Offres
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tender/create')}
            sx={{ backgroundColor: institutionalTheme.palette.primary.main }}
          >
            Créer un Appel d'Offres
          </Button>
        </Box>

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        {!loading && !error && (
          <Paper sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                  <TableRow>
                    <TableCell>Titre de l'Appel d'Offres</TableCell>
                    <TableCell>Date de Clôture</TableCell>
                    <TableCell>Niveau d'Attribution</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTenders.map((tender) => (
                    <TableRow key={tender.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(tender.id)}>
                      <TableCell sx={{ fontWeight: 500 }}>{tender.title}</TableCell>
                      <TableCell>{format(new Date(tender.submission_deadline), 'd MMMM yyyy, HH:mm', { locale: fr })}</TableCell>
                      <TableCell>{tender.award_level === 'lot' ? 'Par Lot' : tender.award_level === 'article' ? 'Par Article' : 'Global'}</TableCell>
                      <TableCell><TenderStatusChip status={tender.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={tenders.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page :"
            />
          </Paper>
        )}
      </Container>
    </Box>
  );
}