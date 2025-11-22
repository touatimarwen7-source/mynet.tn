import { useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
} from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function AboutPage() {
  useEffect(() => {
    setPageTitle('À Propos de MyNet.tn');
  }, []);

  return (
    <Box sx={{ backgroundColor: '#fafafa' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          color: 'white',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ fontSize: '44px', fontWeight: 600, marginBottom: '16px' }}>
            À Propos de MyNet.tn
          </Typography>
          <Typography sx={{ fontSize: '18px', color: '#e3f2fd' }}>
            Transforming Public Procurement in Tunisia
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ paddingY: '60px' }}>
        {/* Story Section */}
        <Box sx={{ marginBottom: '60px' }}>
          <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: '#212121', marginBottom: '40px', textAlign: 'center' }}>
            📖 Notre Histoire et Vision
          </Typography>

          <Grid container spacing={2} sx={{ marginBottom: '40px' }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: '1px solid #e0e0e0', transition: 'all 0.3s', '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}>
                <CardContent sx={{ padding: '32px' }}>
                  <Typography sx={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>⚠️</Typography>
                  <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '12px' }}>
                    Le Problème
                  </Typography>
                  <Typography sx={{ color: '#616161', lineHeight: 1.8 }}>
                    En Tunisie, les marchés publics étaient fragilisés par manque de transparence, absence de normes uniformes et risques élevés de collusion.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: '1px solid #e0e0e0', transition: 'all 0.3s', '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}>
                <CardContent sx={{ padding: '32px' }}>
                  <Typography sx={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>✨</Typography>
                  <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '12px' }}>
                    Notre Solution
                  </Typography>
                  <Typography sx={{ color: '#616161', lineHeight: 1.8 }}>
                    Une plateforme numérique entièrement sécurisée, transparente et conforme aux standards internationaux utilisant l'IA et la blockchain.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', border: '1px solid #e0e0e0', transition: 'all 0.3s', '&:hover': { boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } }}>
                <CardContent sx={{ padding: '32px' }}>
                  <Typography sx={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>🎯</Typography>
                  <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '12px' }}>
                    Notre Vision
                  </Typography>
                  <Typography sx={{ color: '#616161', lineHeight: 1.8 }}>
                    Être la plateforme de référence pour la gestion des appels d'offres en Afrique du Nord où chaque entreprise a accès aux mêmes opportunités.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Values Section */}
        <Box sx={{ marginBottom: '60px' }}>
          <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: '#212121', marginBottom: '40px', textAlign: 'center' }}>
            Nos Valeurs Fondamentales
          </Typography>

          <Grid container spacing={2}>
            {[
              { icon: '🔐', title: 'Sécurité', desc: 'La confiance est notre priorité absolue' },
              { icon: '👁️', title: 'Transparence', desc: 'Zéro compromis sur la clarté des processus' },
              { icon: '⚖️', title: 'Équité', desc: 'Égalité des chances pour tous les participants' },
              { icon: '🚀', title: 'Innovation', desc: 'Technologie de pointe pour un avenir meilleur' },
            ].map((value, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ height: '100%', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                  <CardContent sx={{ padding: '24px' }}>
                    <Typography sx={{ fontSize: '44px', marginBottom: '12px' }}>{value.icon}</Typography>
                    <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: '#212121', marginBottom: '8px' }}>
                      {value.title}
                    </Typography>
                    <Typography sx={{ color: '#616161', fontSize: '14px' }}>
                      {value.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box>
          <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: '#212121', marginBottom: '40px', textAlign: 'center' }}>
            👥 L'Équipe Dirigeante
          </Typography>

          <Grid container spacing={2}>
            {[
              { name: 'Mohamed Dhaoui', role: 'Fondateur & Directeur Général', bio: 'Entrepreneur tunisien avec 15 ans d\'expérience en technologie' },
              { name: 'Fatima Belgacem', role: 'Directrice Technique', bio: 'Experte en sécurité informatique et blockchain' },
              { name: 'Karim Mansouri', role: 'Directeur Juridique', bio: 'Spécialiste des marchés publics et du droit commercial' },
              { name: 'Leila Saibi', role: 'Directrice du Développement', bio: 'Expert en partenariats publics-privés' },
            ].map((member, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ padding: '24px', display: 'flex', gap: '20px' }}>
                    <Box
                      sx={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: '#1565c0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '32px',
                        flexShrink: 0,
                      }}
                    >
                      👨‍💼
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontSize: '16px', fontWeight: 600, color: '#212121' }}>
                        {member.name}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#1565c0', fontWeight: 600, marginBottom: '8px' }}>
                        {member.role}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: '#616161', lineHeight: 1.6 }}>
                        {member.bio}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
