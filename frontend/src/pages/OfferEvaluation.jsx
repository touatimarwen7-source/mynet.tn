import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from '../api/axiosConfig';
import institutionalTheme from '../theme/theme';

export default function OfferEvaluation({ tenderId }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [evaluationType, setEvaluationType] = useState('technical');
  const [scores, setScores] = useState({ technical: '', financial: '', comments: '' });
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, [tenderId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/evaluation/opening/${tenderId}`);
      setOffers(response.data.offers || []);
    } catch (err) {
      setError('فشل في تحميل العروض');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (offer, type) => {
    setSelectedOffer(offer);
    setEvaluationType(type);
    setDialogOpen(true);
  };

  const handleSubmitEvaluation = async () => {
    try {
      if (!scores[evaluationType]) {
        setError('يرجى إدخال الدرجة');
        return;
      }
      const endpoint = evaluationType === 'technical'
        ? `/api/evaluation/technical/${selectedOffer.id}`
        : `/api/evaluation/financial/${selectedOffer.id}`;
      await axios.post(endpoint, { [`${evaluationType}_score`]: parseFloat(scores[evaluationType]), comments: scores.comments });
      setScores({ technical: '', financial: '', comments: '' });
      setDialogOpen(false);
      fetchOffers();
      setError(null);
    } catch (err) {
      setError('فشل في حفظ التقييم');
    }
  };

  const calculateFinalScores = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`/api/evaluation/calculate/${tenderId}`);
      setSummary(response.data.results || []);
    } catch (err) {
      setError('فشل في حساب النتائج النهائية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h5" sx={{ mb: 3, color: institutionalTheme.palette.primary.main, fontWeight: 'bold' }}>
        📊 تقييم العروض
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                تقييم العروض المقدمة
              </Typography>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>رقم العرض</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>اسم المزود</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>المبلغ (TND)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>التقييم الفني</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>التقييم المالي</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>الإجراء</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>{offer.offer_number}</TableCell>
                      <TableCell>{offer.company_name || offer.username}</TableCell>
                      <TableCell>{offer.total_amount}</TableCell>
                      <TableCell>{offer.technical_score ? `${offer.technical_score}/100` : 'قيد الانتظار'}</TableCell>
                      <TableCell>{offer.financial_score ? `${offer.financial_score}/100` : 'قيد الانتظار'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" onClick={() => handleOpenDialog(offer, 'technical')} sx={{ color: institutionalTheme.palette.primary.main }}>
                            فني
                          </Button>
                          <Button size="small" onClick={() => handleOpenDialog(offer, 'financial')} sx={{ color: institutionalTheme.palette.primary.main }}>
                            مالي
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button variant="contained" onClick={calculateFinalScores} sx={{ mt: 2, backgroundColor: institutionalTheme.palette.primary.main }}>
                حساب النتائج النهائية
              </Button>
            </CardContent>
          </Card>
          {summary.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  ✓ النتائج النهائية (استشارية)
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e8f5e9' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>الترتيب</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>رقم العرض</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>الفني</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>المالي</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>النتيجة النهائية</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summary.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{item.rank}</TableCell>
                        <TableCell>{item.offer_number}</TableCell>
                        <TableCell>{item.technical_score}</TableCell>
                        <TableCell>{item.financial_score}</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: institutionalTheme.palette.primary.main }}>
                          {item.final_score}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Alert severity="info" sx={{ mt: 2 }}>
                  ℹ️ هذه النتائج استشارية فقط ولا تلزم المشتري بأي قرار
                </Alert>
              </CardContent>
            </Card>
          )}
        </>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {evaluationType === 'technical' ? 'التقييم الفني' : 'التقييم المالي'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="الدرجة (0-100)" type="number" inputProps={{ min: 0, max: 100 }} value={scores[evaluationType]} onChange={(e) => setScores({ ...scores, [evaluationType]: e.target.value })} margin="normal" />
          <TextField fullWidth label="التعليقات والملاحظات" value={scores.comments} onChange={(e) => setScores({ ...scores, comments: e.target.value })} multiline rows={4} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>إغلاق</Button>
          <Button onClick={handleSubmitEvaluation} variant="contained" sx={{ backgroundColor: institutionalTheme.palette.primary.main }}>
            حفظ التقييم
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
