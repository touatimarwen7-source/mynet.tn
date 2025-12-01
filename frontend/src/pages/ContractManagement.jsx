import { useEffect } from 'react'; // ✅ إزالة useState
import institutionalTheme from '../theme/theme'; // ✅ تعديل المسار إذا لزم الأمر
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
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { setPageTitle } from '../utils/pageTitle';
import { formatDate } from '../utils/dateFormatter';
import { useFetchData } from '../hooks/useFetchData'; // ✅ 1. استيراد الخطاف
import api from '../services/api'; // ✅ 2. استيراد api لإرسال التحديثات

export default function ContractManagement() {
  const theme = institutionalTheme;

  // ✅ 3. جلب البيانات الحقيقية من الواجهة الخلفية
  const { data: contractData, loading, error, refetch } = useFetchData('/procurement/contracts');
  const contracts = contractData?.contracts || [];

  useEffect(() => {
    setPageTitle('Gestion des Contrats');
  }, []);

  // ✅ 4. تحديث منطق توقيع العقد ليتفاعل مع الواجهة الخلفية
  const handleSignContract = async (id) => {
    try {
      await api.patch(`/procurement/contracts/${id}/sign`);
      refetch(); // إعادة جلب البيانات لتحديث الواجهة
    } catch (err) {
      console.error("Failed to sign contract:", err);
      // يمكن إضافة رسالة خطأ للمستخدم هنا
    }
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: institutionalTheme.palette.text.primary, marginBottom: '8px' }}>
          📜 Gestion des Contrats
        </Typography>
        <Typography sx={{ color: '#616161', marginBottom: '32px' }}>
          Suivi des contrats et obligations
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Card sx={{ border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Paper sx={{ border: 'none', borderRadius: 0 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow sx={{ height: '56px' }}>
                  <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Numéro</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Fournisseur</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }} align="right">Montant</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Date Début</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }}>Date Fin</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: institutionalTheme.palette.primary.main }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.map(contract => (
                  <TableRow key={contract.id} sx={{ borderBottom: '1px solid #e0e0e0', '&:hover': { backgroundColor: '#fafafa' } }}>
                    <TableCell sx={{ color: institutionalTheme.palette.text.primary, fontWeight: 600 }}>{contract.number}</TableCell>
                    <TableCell sx={{ color: institutionalTheme.palette.text.primary }}>{contract.supplier}</TableCell>
                    <TableCell align="right" sx={{ color: institutionalTheme.palette.primary.main, fontWeight: 600 }}>
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
                          sx={{ color: institutionalTheme.palette.primary.main, borderColor: institutionalTheme.palette.primary.main, textTransform: 'none' }}
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
        )}
      </Container>
    </Box>
  );
}
