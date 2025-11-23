import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { useToast } from '../contexts/AppContext';
import axiosInstance from '../services/axiosConfig';
import { setPageTitle } from '../utils/pageTitle';

export default function PasswordReset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const [step, setStep] = useState(0); // 0: request, 1: verify token, 2: reset password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/password-reset/request', { email });
      addToast('📧 Email de réinitialisation envoyé', 'success');
      setStep(1);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la demande';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/password-reset/verify-token', { token });
      if (response.data.valid) {
        setStep(2);
        addToast('✅ Token valide', 'success');
      } else {
        setError(response.data.error || 'Token invalide');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Token invalide ou expiré';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post('/auth/password-reset/reset', {
        token,
        newPassword,
      });
      addToast('✅ Mot de passe réinitialisé avec succès', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la réinitialisation';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, minHeight: '100vh', paddingY: '60px' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: '8px' }}>
          <CardContent sx={{ padding: '48px 40px' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: '28px',
                fontWeight: 500,
                color: theme.palette.primary.main,
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              🔐 Réinitialiser le mot de passe
            </Typography>

            <Stepper activeStep={step} sx={{ marginBottom: '32px' }}>
              <Step>
                <StepLabel>Demander</StepLabel>
              </Step>
              <Step>
                <StepLabel>Vérifier</StepLabel>
              </Step>
              <Step>
                <StepLabel>Réinitialiser</StepLabel>
              </Step>
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ marginBottom: '16px' }}>
                {error}
              </Alert>
            )}

            {step === 0 && (
              <form onSubmit={handleRequestReset}>
                <TextField
                  fullWidth
                  type="email"
                  label="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  margin="normal"
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    marginTop: '24px',
                    padding: '12px',
                  }}
                  disabled={loading}
                  type="submit"
                >
                  {loading ? <CircularProgress size={24} /> : 'Envoyer le lien'}
                </Button>
              </form>
            )}

            {step === 1 && (
              <form onSubmit={handleVerifyToken}>
                <TextField
                  fullWidth
                  label="Code de réinitialisation"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={loading}
                  margin="normal"
                  required
                  helperText="Entrez le code reçu par email"
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    marginTop: '24px',
                    padding: '12px',
                  }}
                  disabled={loading}
                  type="submit"
                >
                  {loading ? <CircularProgress size={24} /> : 'Vérifier'}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword}>
                <TextField
                  fullWidth
                  type="password"
                  label="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  margin="normal"
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    marginTop: '24px',
                    padding: '12px',
                  }}
                  disabled={loading}
                  type="submit"
                >
                  {loading ? <CircularProgress size={24} /> : 'Réinitialiser'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
