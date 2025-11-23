import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Chip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { setPageTitle } from '../utils/pageTitle';
import { formatDate } from '../utils/dateFormatter';

export default function ContractManagement() {
  const theme = institutionalTheme;
  const [contracts, setContracts] = useState([
    { id: 1, number: 'CTR-2025-001', supplier: 'Fournisseur A', amount: 40000, status: 'signed', start_date: new Date(), end_date: new Date(Date.now() + 90*24*60*60*1000) },
    { id: 2, number: 'CTR-2025-002', supplier: 'Fournisseur B', amount: 52000, status: 'draft', start_date: new Date(), end_date: new Date(Date.now() + 120*24*60*60*1000) }
  ]);

  useEffect(() => {
    setPageTitle('Gestion des Contrats');
  }, []);

  const handleSignContract = (id) => {
    setContracts(contracts.map(c => c.id === id ? {...c, status: 'signed'} : c));
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '8px' }}>
          📜 Gestion des Contrats
        </Typography>
        <Typography sx={{ color: '#616161', marginBottom: '32px' }}>
          Suivi des contrats et obligations
        </Typography>

        <Card sx={{ border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <Paper sx={{ border: 'none', borderRadius: 0 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow sx={{ height: '56px' }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Numéro</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Fournisseur</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Montant</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date Début</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Date Fin</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.map(contract => (
                  <TableRow key={contract.id} sx={{ borderBottom: '1px solid #e0e0e0', '&:hover': { backgroundColor: '#fafafa' } }}>
                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>{contract.number}</TableCell>
                    <TableCell sx={{ color: theme.palette.text.primary }}>{contract.supplier}</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                      {contract.amount.toLocaleString()} TND
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contract.status === 'signed' ? '✓ Signé' : '⏳ Brouillon'}
                        sx={{
                          backgroundColor: contract.status === 'signed' ? '#e8f5e9' : '#fff3e0',
                          color: contract.status === 'signed' ? '#1b5e20' : '#e65100',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#616161' }}>{formatDate(contract.start_date)}</TableCell>
                    <TableCell sx={{ color: '#616161' }}>{formatDate(contract.end_date)}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          sx={{ color: theme.palette.primary.main, borderColor: theme.palette.primary.main, textTransform: 'none' }}
                        >
                          Voir
                        </Button>
                        {contract.status === 'draft' && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleSignContract(contract.id)}
                            sx={{
                              backgroundColor: '#2e7d32',
                              '&:hover': { backgroundColor: '#1b5e20' },
                              textTransform: 'none',
                            }}
                          >
                            Signer
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Card>
      </Container>
    </Box>
  );
}
