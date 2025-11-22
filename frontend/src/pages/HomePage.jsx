import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import ThunderStormIcon from '@mui/icons-material/ThunderstormSharp';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { setPageTitle } from '../utils/pageTitle';
import DynamicAdvertisement from '../components/DynamicAdvertisement';
import HowItWorks from '../components/HowItWorks';
import LeadGenerationForm from '../components/LeadGenerationForm';
import HeroSearch from '../components/HeroSearch';

export default function HomePage() {
  setPageTitle('Accueil');
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleStartTrial = (role) => {
    setSelectedRole(role);
    setTimeout(() => navigate(`/register?role=${role}`), 300);
  };

  // Stats Data
  const stats = [
    { number: '50M+', label: 'Dinars', description: 'Montants d\'appels d\'offres traités' },
    { number: '1,200+', label: 'Organisations', description: 'Acheteurs et fournisseurs' },
    { number: '15,000+', label: 'Appels d\'Offres', description: 'Publiés avec succès' },
    { number: '99.9%', label: 'Disponibilité', description: 'Infrastructure sécurisée' },
  ];

  // Testimonials Data
  const testimonials = [
    {
      text: 'MyNet.tn a révolutionné notre processus d\'achat. Plus de transparence, moins de papiers, et une meilleure gestion des fournisseurs.',
      author: '— Directeur des Achats, Entreprise Manufacturière',
    },
    {
      text: 'Accès à plus d\'opportunités commerciales. La plateforme est facile à utiliser et les outils d\'offres sont complets.',
      author: '— Responsable Commercial, PME de Fournitures',
    },
    {
      text: 'La sécurité et la conformité des données sont au cœur de MyNet.tn. Nous recommandons vivement cette plateforme.',
      author: '— Directeur Financier, Grande Entreprise',
    },
  ];

  // Features Data
  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
      title: 'Sécurité Entreprise',
      description: 'Chiffrement AES-256, authentification 2FA, et audit complet',
    },
    {
      icon: <ThunderStormIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
      title: 'Performant',
      description: 'Infrastructure cloud scalable avec 99.9% d\'uptime',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
      title: 'Support Premium',
      description: 'Équipe d\'experts disponible 24/7',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
      title: 'Analytics Avancées',
      description: 'Tableaux de bord détaillés et rapports en temps réel',
    },
    {
      icon: <LanguageIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
      title: 'Multi-Devises',
      description: 'Support dinars, euros et autres devises',
    },
    {
      icon: <PhoneAndroidIcon sx={{ fontSize: 32, color: '#1565c0' }} />,
      title: 'Mobile Ready',
      description: 'Interface responsive pour tous les appareils',
    },
  ];

  // Role Cards Data
  const roles = [
    {
      id: 'buyer',
      title: 'Je suis Acheteur',
      description: 'Publiez vos appels d\'offres, recevez les meilleures propositions, évaluez les fournisseurs et finalisez vos contrats en toute confiance.',
      features: [
        'Créer des appels d\'offres',
        'Gérer les soumissions',
        'Analyser les offres',
        'Émettre des bons de commande',
        'Gérer l\'équipe d\'achat',
      ],
    },
    {
      id: 'supplier',
      title: 'Je suis Fournisseur',
      description: 'Découvrez les opportunités de marché, soumettez vos offres compétitives, et développez votre activité avec des clients de confiance.',
      features: [
        'Parcourir les appels d\'offres',
        'Soumettre des offres',
        'Gérer votre catalogue',
        'Suivre les évaluations',
        'Recevoir les commandes',
      ],
    },
  ];

  return (
    <Box sx={{ backgroundColor: '#fafafa' }}>
      {/* Hero Section */}
      <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0e0e0', paddingBottom: '40px' }}>
        <HeroSearch />
      </Box>

      {/* Advertisement Section */}
      <Box sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <DynamicAdvertisement />
      </Box>

      {/* Roles Section */}
      <Container maxWidth="lg" sx={{ paddingY: '60px' }}>
        <Box sx={{ textAlign: 'center', marginBottom: '48px' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: '32px',
              fontWeight: 500,
              color: '#212121',
              marginBottom: '12px',
            }}
          >
            Choisissez Votre Rôle
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '16px',
              color: '#616161',
            }}
          >
            Deux expériences optimisées, une plateforme unifiée
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {roles.map((role) => (
            <Grid item xs={12} md={6} key={role.id}>
              <Card
                sx={{
                  height: '100%',
                  border: selectedRole === role.id ? '2px solid #1565c0' : '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: selectedRole === role.id ? '0 8px 16px rgba(21, 101, 192, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.08)',
                  transition: 'all 300ms ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#1565c0',
                    boxShadow: '0 8px 16px rgba(21, 101, 192, 0.15)',
                  },
                }}
                onClick={() => setSelectedRole(role.id)}
              >
                <CardContent sx={{ padding: '32px' }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: '24px',
                      fontWeight: 500,
                      color: '#1565c0',
                      marginBottom: '16px',
                    }}
                  >
                    {role.title}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: '#616161',
                      marginBottom: '24px',
                      lineHeight: 1.6,
                    }}
                  >
                    {role.description}
                  </Typography>

                  <List sx={{ marginBottom: '24px' }}>
                    {role.features.map((feature, idx) => (
                      <ListItem key={idx} sx={{ paddingLeft: 0, paddingTop: '6px', paddingBottom: '6px' }}>
                        <ListItemIcon sx={{ minWidth: 32, color: '#2e7d32' }}>
                          <CheckCircleIcon sx={{ fontSize: 18 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
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

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleStartTrial(role.id)}
                    sx={{
                      backgroundColor: '#1565c0',
                      textTransform: 'none',
                      fontWeight: 500,
                      padding: '12px 24px',
                      minHeight: '44px',
                      '&:hover': {
                        backgroundColor: '#0d47a1',
                      },
                    }}
                  >
                    Commencer Essai Gratuit
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Social Proof Section */}
      <Box sx={{ backgroundColor: '#ffffff', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', paddingY: '60px' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: '32px',
              fontWeight: 500,
              color: '#212121',
              textAlign: 'center',
              marginBottom: '48px',
            }}
          >
            Faites Confiance à MyNet.tn
          </Typography>

          {/* Stats Grid */}
          <Grid container spacing={2} sx={{ marginBottom: '48px' }}>
            {stats.map((stat, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper
                  sx={{
                    padding: '32px 24px',
                    textAlign: 'center',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '32px',
                      fontWeight: 600,
                      color: '#1565c0',
                      marginBottom: '8px',
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#212121',
                      marginBottom: '4px',
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#616161',
                    }}
                  >
                    {stat.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Testimonials */}
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#212121',
                marginBottom: '24px',
              }}
            >
              Ce que Disent nos Utilisateurs
            </Typography>
            <Grid container spacing={2}>
              {testimonials.map((testimonial, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <Paper
                    sx={{
                      padding: '24px',
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '14px',
                        color: '#212121',
                        marginBottom: '12px',
                        flex: 1,
                        lineHeight: 1.6,
                      }}
                    >
                      "{testimonial.text}"
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        color: '#616161',
                        fontStyle: 'italic',
                      }}
                    >
                      {testimonial.author}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ paddingY: '60px' }}>
        <Typography
          variant="h2"
          sx={{
            fontSize: '32px',
            fontWeight: 500,
            color: '#212121',
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          Pourquoi Choisir MyNet.tn?
        </Typography>

        <Grid container spacing={2}>
          {features.map((feature, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card
                sx={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  transition: 'all 200ms ease-in-out',
                  '&:hover': {
                    borderColor: '#1565c0',
                    boxShadow: '0 8px 16px rgba(21, 101, 192, 0.1)',
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box sx={{ marginBottom: '16px' }}>
                  {feature.icon}
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#212121',
                    marginBottom: '12px',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: '#616161',
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', paddingY: '60px' }}>
        <HowItWorks />
      </Box>

      {/* Lead Generation */}
      <Box sx={{ backgroundColor: '#ffffff', paddingY: '60px' }}>
        <LeadGenerationForm />
      </Box>

      {/* Final CTA Section */}
      <Box
        sx={{
          backgroundColor: '#1565c0',
          color: '#ffffff',
          paddingY: '80px',
          backgroundImage: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: '36px',
                fontWeight: 500,
                marginBottom: '16px',
              }}
            >
              Prêt à Transformer Votre Processus d'Achat?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: '18px',
                marginBottom: '40px',
                opacity: 0.9,
              }}
            >
              Rejoignez plus de 1,200 organisations qui font confiance à MyNet.tn
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', marginBottom: '24px' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#1565c0',
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '14px 32px',
                  minHeight: '48px',
                  fontSize: '16px',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                🚀 Demander une Démonstration
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: '#ffffff',
                  color: '#ffffff',
                  textTransform: 'none',
                  fontWeight: 600,
                  padding: '14px 32px',
                  minHeight: '48px',
                  fontSize: '16px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: '#ffffff',
                  },
                }}
              >
                Déjà Inscrit? Se Connecter →
              </Button>
            </Stack>

            <Typography
              sx={{
                fontSize: '13px',
                opacity: 0.85,
              }}
            >
              Pas de carte bancaire requise • Accès gratuit pendant 30 jours • Support dédié inclus
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
