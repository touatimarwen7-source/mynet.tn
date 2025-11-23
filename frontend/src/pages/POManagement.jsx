import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { TableSkeleton } from '../components/SkeletonLoader';
import { StatusBadge } from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

export default function POManagement() {
  const navigate = useNavigate();
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockPOs = [
        {
          id: 'PO-001',
          number: 'PO-2025-001',
          supplier: 'TechCorp TN',
          amount: 5000,
          currency: 'TND',
          status: 'confirme',
          createdAt: '2025-01-15',
          deliveryDate: '2025-02-15',
          items: 3,
        },
        {
          id: 'PO-002',
          number: 'PO-2025-002',
          supplier: 'Supply Inc',
          amount: 12000,
          currency: 'TND',
          status: 'en_attente',
          createdAt: '2025-01-20',
          deliveryDate: '2025-02-28',
          items: 5,
        },
        {
          id: 'PO-003',
          number: 'PO-2025-003',
          supplier: 'Industrial Pro',
          amount: 8500,
          currency: 'TND',
          status: 'livree',
          createdAt: '2025-01-10',
          deliveryDate: '2025-01-25',
          items: 2,
        },
      ];
      setPos(mockPOs);
    } finally {
      setLoading(false);
    }
  };

  const filteredPOs = pos.filter(po =>
    (po.supplier.toLowerCase().includes(filter.toLowerCase()) ||
     po.number.toLowerCase().includes(filter.toLowerCase())) &&
    (!statusFilter || po.status === statusFilter)
  );

  const totalPages = Math.ceil(filteredPOs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPOs = filteredPOs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
        <Container maxWidth="lg">
          <Typography sx={{ marginBottom: '24px', fontWeight: 600, color: theme.palette.primary.main }}>
            Gestion des Bons de Commande
          </Typography>
          <TableSkeleton rows={5} columns={6} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ marginBottom: '32px', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Gestion des Bons de Commande
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/po-create')}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            Nouveau Bon de Commande
          </Button>
        </Stack>

        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Rechercher par numéro ou fournisseur..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                variant="outlined"
                inputProps={{ 'aria-label': 'Rechercher les bons de commande' }}
              />
              <FormControl fullWidth>
                <InputLabel id="status-label">Filtrer par statut</InputLabel>
                <Select
                  labelId="status-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filtrer par statut"
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="en_attente">En Attente</MenuItem>
                  <MenuItem value="confirme">Confirmé</MenuItem>
                  <MenuItem value="en_route">En Route</MenuItem>
                  <MenuItem value="livree">Livrée</MenuItem>
                  <MenuItem value="annule">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>N° Bon</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Fournisseur</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Montant</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Livraison</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPOs.map((po) => (
                <TableRow key={po.id} hover>
                  <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>{po.number}</TableCell>
                  <TableCell>{po.supplier}</TableCell>
                  <TableCell>{po.amount.toLocaleString()} {po.currency}</TableCell>
                  <TableCell>
                    <StatusBadge status={po.status} />
                  </TableCell>
                  <TableCell>{po.deliveryDate}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/po-detail/${po.id}`)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        Détails
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/po-edit/${po.id}`)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        Modifier
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {paginatedPOs.length === 0 && (
          <Box sx={{ textAlign: 'center', paddingY: '40px' }}>
            <Typography sx={{ color: '#666' }}>
              Aucun bon de commande trouvé
            </Typography>
          </Box>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredPOs.length}
          />
        )}
      </Container>
    </Box>
  );
}
