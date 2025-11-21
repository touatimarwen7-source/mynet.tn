import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useToastContext } from '../contexts/ToastContext';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToastContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPageTitle('Connexion Sécurisée');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      window.dispatchEvent(new Event('authChanged'));
      
      addToast('Connexion réussie', 'success', 2000);
      
      setTimeout(() => {
        navigate('/tenders');
      }, 100);
    } catch (err) {
      setError('Erreur de connexion. Vérifiez vos identifiants.');
      addToast('Erreur de connexion', 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingY: '60px' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.12)' }}>
          <CardContent sx={{ padding: '48px 40px' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: '28px',
                fontWeight: 500,
                color: '#1565c0',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              Connexion Sécurisée
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: '#616161',
                marginBottom: '32px',
                textAlign: 'center',
              }}
            >
              Connectez-vous à votre compte MyNet.tn
            </Typography>

            {error && (
              <Alert severity="error" sx={{ marginBottom: '24px' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre adresse e-mail"
                required
                variant="outlined"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                required
                variant="outlined"
                disabled={loading}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  minHeight: '44px',
                  backgroundColor: '#1565c0',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '16px',
                  '&:hover': { backgroundColor: '#0d47a1' },
                  '&:disabled': { backgroundColor: '#e0e0e0' },
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CircularProgress size={20} sx={{ color: '#1565c0' }} />
                    Connexion en cours...
                  </Box>
                ) : (
                  'Se Connecter'
                )}
              </Button>
            </Box>

            <Typography sx={{ marginTop: '24px', textAlign: 'center', color: '#616161' }}>
              Pas encore de compte?{' '}
              <Link
                href="/register"
                sx={{
                  color: '#1565c0',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                S'inscrire
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
