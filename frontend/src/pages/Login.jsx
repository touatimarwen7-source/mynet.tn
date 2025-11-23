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
import { useToast } from '../contexts/AppContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { authSchemas } from '../utils/validationSchemas';
import { authAPI } from '../api';
import TokenManager from '../services/tokenManager';
import { setPageTitle } from '../utils/pageTitle';

export default function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [apiError, setApiError] = useState('');

  const form = useFormValidation(
    { email: '', password: '' },
    authSchemas.login,
    async (values) => {
      setApiError('');
      try {
        const response = await authAPI.login(values);
        
        if (!response || !response.data) {
          throw new Error('Réponse du serveur invalide');
        }
        
        if (!response.data.accessToken) {
          throw new Error('Pas de token reçu du serveur');
        }
        
        // Store tokens securely
        const expiresIn = response.data.expiresIn || 900;
        TokenManager.setAccessToken(response.data.accessToken, expiresIn);
        
        const refreshToken = response.data.refreshToken || response.data.refreshTokenId;
        if (refreshToken) {
          TokenManager.setRefreshTokenId(refreshToken);
        }
        
        const userData = response.data.user;
        TokenManager.setUserData(userData);
        
        addToast('Connexion réussie', 'success', 2000);
        window.dispatchEvent(new CustomEvent('authChanged', { detail: userData }));
        
        // Navigate based on role
        let redirectPath = '/tenders';
        if (userData.role === 'admin' || userData.role === 'super_admin') {
          redirectPath = '/admin';
        } else if (userData.role === 'buyer') {
          redirectPath = '/buyer-dashboard';
        } else if (userData.role === 'supplier') {
          redirectPath = '/supplier-search';
        }
        
        navigate(redirectPath, { replace: true });
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Erreur de connexion. Vérifiez vos identifiants.';
        setApiError(errorMsg);
        addToast(errorMsg, 'error', 3000);
      }
    }
  );

  useEffect(() => {
    setPageTitle('Connexion Sécurisée');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    form.handleSubmit(e);
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingY: '60px' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: '8px', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '48px 40px' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: '28px',
                fontWeight: 500,
                color: theme.palette.primary.main,
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              Connexion Sécurisée
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '16px' }}>
              <Link 
                href="/password-reset"
                sx={{ fontSize: '13px', color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Mot de passe oublié?
              </Link>
              <Link 
                href="/register"
                sx={{ fontSize: '13px', color: theme.palette.primary.main, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Créer un compte
              </Link>
            </Box>

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

            {apiError && (
              <Alert severity="error" sx={{ marginBottom: '24px' }}>
                {apiError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                {...form.getFieldProps('email')}
                placeholder="Entrez votre adresse e-mail"
                variant="outlined"
                disabled={form.isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-error fieldset': {
                      borderColor: '#d32f2f'
                    }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                {...form.getFieldProps('password')}
                placeholder="Entrez votre mot de passe"
                variant="outlined"
                disabled={form.isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-error fieldset': {
                      borderColor: '#d32f2f'
                    }
                  }
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={form.isSubmitting || !form.isDirty}
                sx={{
                  minHeight: '44px',
                  backgroundColor: theme.palette.primary.main,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '16px',
                  '&:hover': { backgroundColor: '#0d47a1' },
                  '&:disabled': { backgroundColor: '#e0e0e0' },
                }}
              >
                {form.isSubmitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
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
                  color: theme.palette.primary.main,
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
