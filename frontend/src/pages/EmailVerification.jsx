import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useToast } from '../contexts/AppContext';
import axiosInstance from '../services/axiosConfig';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de vérification manquant');
        return;
      }

      try {
        const response = await axiosInstance.post('/auth/password-reset/verify-email', { token });
        if (response.data.success) {
          setStatus('success');
          setMessage('✅ Email vérifié avec succès!');
          addToast('Email vérifié', 'success');
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(response.data.error || 'Erreur de vérification');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Le lien de vérification a expiré');
        addToast('Vérification échouée', 'error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, addToast]);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', paddingY: '60px' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: '8px', textAlign: 'center' }}>
          <CardContent sx={{ padding: '48px 40px' }}>
            {status === 'verifying' && (
              <>
                <CircularProgress sx={{ color: theme.palette.primary.main, marginBottom: '24px' }} />
                <Typography variant="h6">{message}</Typography>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircleIcon
                  sx={{
                    fontSize: '64px',
                    color: '#4CAF50',
                    marginBottom: '24px',
                  }}
                />
                <Typography variant="h5" sx={{ color: '#4CAF50', marginBottom: '16px' }}>
                  {message}
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, marginBottom: '24px' }}>
                  Vous allez être redirigé vers la connexion...
                </Typography>
              </>
            )}

            {status === 'error' && (
              <>
                <ErrorIcon
                  sx={{
                    fontSize: '64px',
                    color: '#f44336',
                    marginBottom: '24px',
                  }}
                />
                <Alert severity="error" sx={{ marginBottom: '24px' }}>
                  {message}
                </Alert>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: theme.palette.primary.main }}
                  onClick={() => navigate('/password-reset')}
                >
                  Demander un nouveau lien
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
