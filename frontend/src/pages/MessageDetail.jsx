import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import BackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';
import axiosInstance from '../services/axiosConfig';

export default function MessageDetail() {
  const theme = institutionalTheme;
  const { messageId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setPageTitle('Détails du Message');
    fetchMessage();
  }, [messageId]);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/messaging/${messageId}`);
      setMessage(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement du message');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message?')) return;
    try {
      await axiosInstance.delete(`/messaging/${messageId}`);
      navigate('/inbox');
    } catch (err) {
      setError('خطأ في حذف الرسالة');
    }
  };

  const handleReply = () => {
    navigate('/compose', {
      state: {
        receiver_id: message.sender_id,
        subject: message.subject ? `Réponse: ${message.subject}` : 'Réponse',
      }
    });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Container>
    );
  }

  if (!message) {
    return (
      <Container>
        <Alert severity="error">الرسالة غير موجودة</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/inbox')}
          sx={{ color: theme.palette.primary.main, marginBottom: '20px' }}
        >
          العودة إلى الصندوق
        </Button>

        {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}

        <Card>
          <CardContent sx={{ padding: '40px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '8px' }}>
                  {message.subject || '(بدون موضوع)'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  من: <strong>{message.sender_company}</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#999' }}>
                  {new Date(message.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: '8px' }}>
                <Button
                  startIcon={<ReplyIcon />}
                  onClick={handleReply}
                  sx={{ color: theme.palette.primary.main }}
                >
                  Réponse
                </Button>
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={handleDelete}
                  sx={{ color: '#f44336' }}
                >
                  حذف
                </Button>
              </Box>
            </Box>

            <Divider sx={{ marginY: '20px' }} />

            <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>

            {message.related_entity_type && (
              <>
                <Divider sx={{ marginY: '20px' }} />
                <Typography variant="caption" sx={{ color: '#999' }}>
                  مرتبطة بـ: {message.related_entity_type}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
