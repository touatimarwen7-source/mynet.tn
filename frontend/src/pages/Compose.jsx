import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';
import axiosInstance from '../services/axiosConfig';

export default function Compose() {
  const navigate = useNavigate();
  const [receivers, setReceivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    receiver_id: null,
    subject: '',
    content: '',
  });

  useEffect(() => {
    setPageTitle('كتابة رسالة جديدة');
    fetchReceivers();
  }, []);

  const fetchReceivers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/search/users');
      setReceivers(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement de la liste des destinataires');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.receiver_id || !formData.content) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setSending(true);
      await axiosInstance.post('/messaging', {
        receiver_id: formData.receiver_id,
        subject: formData.subject,
        content: formData.content,
      });
      setSuccess("تم إرسال الرسالة بنجاح");
      setTimeout(() => navigate('/inbox'), 2000);
    } catch (err) {
      setError("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Card>
          <CardContent sx={{ padding: '40px' }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '30px' }}>
              كتابة رسالة جديدة
            </Typography>

            {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ marginBottom: '20px' }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Autocomplete
                  options={receivers}
                  getOptionLabel={(option) => `${option.company_name} (${option.full_name})`}
                  value={receivers.find(r => r.id === formData.receiver_id) || null}
                  onChange={(e, value) => setFormData({ ...formData, receiver_id: value?.id || null })}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="المستقبل"
                      placeholder="ابحث عن المستقبل..."
                      error={!formData.receiver_id && formData.content !== ''}
                      helperText={!formData.receiver_id && formData.content !== '' ? 'يرجى اختيار مستقبل' : ''}
                    />
                  )}
                />

                <TextField
                  fullWidth
                  label="الموضوع"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="أدخل موضوع الرسالة"
                />

                <TextField
                  fullWidth
                  label="محتوى الرسالة"
                  multiline
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="اكتب رسالتك هنا..."
                  error={!formData.content && formData.receiver_id}
                  helperText={!formData.content && formData.receiver_id ? 'يرجى إدخال محتوى الرسالة' : ''}
                />

                <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/inbox')}
                    disabled={sending}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={sending}
                    startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{ backgroundColor: theme.palette.primary.main }}
                  >
                    {sending ? 'جاري الإرسال...' : 'إرسال'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
