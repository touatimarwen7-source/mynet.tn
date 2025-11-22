import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function Register() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'supplier';
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle('Inscription');
  }, []);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: roleFromUrl,
    company_name: '',
    company_registration: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authAPI.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const getRoleContent = () => {
    if (formData.role === 'buyer') {
      return {
        icon: '🏢',
        title: 'Créer un Compte Acheteur',
        subtitle: 'Publiez vos appels d\'offres et trouvez les meilleurs fournisseurs',
        benefits: [
          'Créer et gérer des appels d\'offres',
          'Recevoir et analyser les offres',
          'Utiliser l\'analyse IA pour décider',
          'Gestion complète de l\'équipe d\'achat'
        ]
      };
    } else {
      return {
        icon: '🏭',
        title: 'Créer un Compte Fournisseur',
        subtitle: 'Découvrez les opportunités et remportez des marchés',
        benefits: [
          'Parcourir les appels d\'offres',
          'Soumettre vos offres sécurisées',
          'Gérer votre catalogue de produits',
          'Suivre votre performance et revenus'
        ]
      };
    }
  };

  const roleContent = getRoleContent();

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingY: '60px' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: '8px', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '48px 40px' }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', marginBottom: '32px' }}>
              <Typography sx={{ fontSize: '48px', marginBottom: '16px' }}>
                {roleContent.icon}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: '28px',
                  fontWeight: 500,
                  color: '#0056B3',
                  marginBottom: '8px',
                }}
              >
                {roleContent.title}
              </Typography>
              <Typography sx={{ color: '#616161', fontSize: '14px' }}>
                {roleContent.subtitle}
              </Typography>
            </Box>

            {/* Benefits */}
            <Box sx={{ marginBottom: '32px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
              <List sx={{ padding: 0 }}>
                {roleContent.benefits.map((benefit, idx) => (
                  <ListItem key={idx} sx={{ paddingLeft: 0, paddingTop: '8px', paddingBottom: '8px' }}>
                    <ListItemIcon sx={{ minWidth: 32, color: '#2e7d32' }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={benefit}
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '14px',
                          color: '#212121',
                          fontWeight: 400,
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {error && (
              <Alert severity="error" sx={{ marginBottom: '24px' }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Entrez votre nom d'utilisateur"
                required
                disabled={loading}
              />

              <TextField
                fullWidth
                label="E-mail"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Entrez votre adresse e-mail"
                required
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Entrez un mot de passe sécurisé"
                required
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Nom complet"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Votre nom complet"
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Votre numéro de téléphone"
                disabled={loading}
              />

              {formData.role === 'buyer' && (
                <>
                  <TextField
                    fullWidth
                    label="Nom de l'entreprise"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Nom de votre entreprise"
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Numéro d'enregistrement"
                    name="company_registration"
                    value={formData.company_registration}
                    onChange={handleChange}
                    placeholder="Numéro d'enregistrement"
                    disabled={loading}
                  />
                </>
              )}

              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  minHeight: '44px',
                  backgroundColor: '#0056B3',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '16px',
                  marginTop: '8px',
                  '&:hover': { backgroundColor: '#0d47a1' },
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CircularProgress size={20} sx={{ color: '#0056B3' }} />
                    Inscription en cours...
                  </Box>
                ) : (
                  'S\'inscrire'
                )}
              </Button>
            </Box>

            <Typography sx={{ marginTop: '24px', textAlign: 'center', color: '#616161' }}>
              Déjà inscrit?{' '}
              <Link
                href="/login"
                sx={{
                  color: '#0056B3',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Se connecter
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
