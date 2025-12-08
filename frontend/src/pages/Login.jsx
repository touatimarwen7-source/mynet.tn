import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
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
import { useToast, useAuth } from '../contexts/AppContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { authSchemas } from '../utils/validationSchemas';
import { authAPI } from '../api';
import TokenManager from '../services/tokenManager';
import { setPageTitle } from '../utils/pageTitle';

export default function Login() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();
  const [apiError, setApiError] = useState('');

  const form = useFormValidation({ email: '', password: '' }, authSchemas.login, async (values) => {
    setApiError('');
    
    try {
      console.log('🔐 Attempting login for:', values.email);
      const response = await authAPI.login(values);
      
      // axiosConfig wraps response in { data: actualResponse }
      const loginData = response.data || response;
      
      console.log('📥 Login response received:', {
        hasData: !!loginData,
        hasToken: !!loginData?.accessToken,
        hasUser: !!loginData?.user
      });

      if (!loginData) {
        console.error('❌ Invalid server response');
        throw new Error('Réponse du serveur invalide');
      }

      if (!loginData.accessToken) {
        console.error('❌ No access token received');
        throw new Error('Pas de token reçu du serveur');
      }

      // Store tokens securely
      TokenManager.setAccessToken(loginData.accessToken);

      const refreshToken = loginData.refreshToken || loginData.refreshTokenId;
      if (refreshToken) {
        TokenManager.setRefreshToken(refreshToken);
      }

      const userData = loginData.user;
      if (!userData || (!userData.userId && !userData.id)) {
        console.error('❌ No user data received');
        throw new Error('Données utilisateur manquantes');
      }
      
      // Normalize userId (backend may send 'id' instead of 'userId')
      userData.userId = userData.userId || userData.id;
      
      console.log('✅ Login successful, user data:', userData);
      
      // Use AppContext login which handles everything
      const success = login(userData);
      
      if (success) {
        addToast('Connexion réussie', 'success', 2000);
        
        // Navigate based on user role
        setTimeout(() => {
          const role = userData.role?.toLowerCase();
          if (role === 'super_admin' || role === 'superadmin') {
            navigate('/super-admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 100);
      } else {
        throw new Error('Échec de la connexion');
      }
      
    } catch (err) {
      console.error('❌ Login error:', err);
      const errorMsg = String(
        err.response?.data?.error || 
        err.response?.data?.message ||
        err.message ||
        'Erreur de connexion. Vérifiez vos identifiants.'
      );
      setApiError(errorMsg);
      addToast(errorMsg, 'error', 3000);
    }
  });

  useEffect(() => {
    setPageTitle('Connexion Sécurisée');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple submissions
    if (form.isSubmitting) {
      console.warn('⚠️ Form already submitting, ignoring duplicate request');
      return;
    }
    
    await form.handleSubmit(e);
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
                color: institutionalTheme.palette.primary.main,
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              Connexion Sécurisée
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <Link
                href="/password-reset"
                sx={{
                  fontSize: '13px',
                  color: institutionalTheme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Mot de passe oublié?
              </Link>
              <Link
                href="/register"
                sx={{
                  fontSize: '13px',
                  color: institutionalTheme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
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

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
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
                      borderColor: '#d32f2f',
                    },
                  },
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
                      borderColor: '#d32f2f',
                    },
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={form.isSubmitting || !form.isDirty}
                sx={{
                  minHeight: '44px',
                  backgroundColor: institutionalTheme.palette.primary.main,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '16px',
                  '&:hover': { backgroundColor: '#0d47a1' },
                  '&:disabled': { backgroundColor: '#e0e0e0' },
                }}
              >
                {form.isSubmitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CircularProgress
                      size={20}
                      sx={{ color: institutionalTheme.palette.primary.main }}
                    />
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
                  color: institutionalTheme.palette.primary.main,
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