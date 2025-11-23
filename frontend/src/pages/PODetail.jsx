import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  Grid,
  Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import { StatusBadge } from '../components/StatusBadge';

export default function PODetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPODetail();
  }, [id]);

  const fetchPODetail = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockPO = {
        id,
        number: 'PO-2025-001',
        supplier: 'TechCorp TN',
        supplierContact: 'contact@techcorp.tn',
        supplierPhone: '+216 71 234 567',
        deliveryAddress: '123 Rue de la Technologie, Tunis 1000',
        amount: 5000,
        currency: 'TND',
        tax: 500,
        total: 5500,
        status: 'confirme',
        createdAt: '2025-01-15',
        createdBy: 'Ahmed Ben Ali',
        deliveryDate: '2025-02-15',
        items: [
          { id: 1, description: 'Ordinateurs portables', qty: 10, unitPrice: 400, total: 4000 },
          { id: 2, description: 'Souris sans fil', qty: 20, unitPrice: 50, total: 1000 },
        ],
      };
      setPo(mockPO);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (!po) {
    return (
      <Container>
        <Typography color="error">Bon de commande non trouvé</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/po-management')}
          sx={{ color: theme.palette.primary.main, marginBottom: '24px' }}
        >
          Retour
        </Button>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ marginBottom: '32px', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              {po.number}
            </Typography>
            <StatusBadge status={po.status} />
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/po-edit/${po.id}`)}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Modifier
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              sx={{ color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}
            >
              Imprimer
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
                  Informations Fournisseur
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Fournisseur</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{po.supplier}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Contact</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{po.supplierContact}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Téléphone</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{po.supplierPhone}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
                  Détails du Bon
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Date de Création</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{po.createdAt}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Date de Livraison</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{po.deliveryDate}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#666' }}>Créé par</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{po.createdBy}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '16px' }}>
              Articles du Bon
            </Typography>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantité</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Prix Unitaire</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {po.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.unitPrice.toLocaleString()} {po.currency}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.total.toLocaleString()} {po.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Stack spacing={2} sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '32px' }}>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#666' }}>Sous-total</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{po.amount.toLocaleString()} {po.currency}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#666' }}>TVA (10%)</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{po.tax.toLocaleString()} {po.currency}</Typography>
                </Box>
                <Box sx={{ borderLeft: '1px solid #e0e0e0', paddingLeft: '32px' }}>
                  <Typography sx={{ fontSize: '12px', color: '#666' }}>Total</Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '18px', color: theme.palette.primary.main }}>
                    {po.total.toLocaleString()} {po.currency}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
