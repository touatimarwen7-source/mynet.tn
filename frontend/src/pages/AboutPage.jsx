import { useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function AboutPage() {
  useEffect(() => {
    setPageTitle('À Propos de MyNet.tn');
  }, []);

  return (
    <Box className="about-page-wrapper">
      {/* Hero Section */}
      <Box className="about-hero-section">
        <Container maxWidth="lg">
          <Typography variant="h1" className="about-hero-title">
            À Propos de MyNet.tn
          </Typography>
          <Typography className="about-hero-subtitle">
            Transforming Public Procurement in Tunisia
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" className="about-main-container">
        {/* Story Section */}
        <Box className="about-story-section">
          <Typography variant="h2" className="about-section-title">
            📖 Notre Histoire et Vision
          </Typography>

          <Grid container spacing={2} className="about-story-grid">
            <Grid sx={{ flex: 1, minWidth: "0px" }}>
              <Card className="about-story-card">
                <CardContent className="about-card-content">
                  <Typography className="about-card-emoji">⚠️</Typography>
                  <Typography variant="h4" className="about-card-title">
                    Le Problème
                  </Typography>
                  <Typography className="about-card-text">
                    En Tunisie, les marchés publics étaient fragilisés par manque de transparence, absence de normes uniformes et risques élevés de collusion.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ flex: 1, minWidth: "0px" }}>
              <Card className="about-story-card">
                <CardContent className="about-card-content">
                  <Typography className="about-card-emoji">✨</Typography>
                  <Typography variant="h4" className="about-card-title">
                    Notre Solution
                  </Typography>
                  <Typography className="about-card-text">
                    Une plateforme numérique entièrement sécurisée, transparente et conforme aux standards internationaux utilisant l'IA et la blockchain.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid sx={{ flex: 1, minWidth: "0px" }}>
              <Card className="about-story-card">
                <CardContent className="about-card-content">
                  <Typography className="about-card-emoji">🎯</Typography>
                  <Typography variant="h4" className="about-card-title">
                    Notre Vision
                  </Typography>
                  <Typography className="about-card-text">
                    Être la plateforme de référence pour la gestion des appels d'offres en Afrique du Nord où chaque entreprise a accès aux mêmes opportunités.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Values Section */}
        <Box className="about-values-section">
          <Typography variant="h2" className="about-section-title">
            Nos Valeurs Fondamentales
          </Typography>

          <Grid container spacing={2}>
            {[
              { icon: '🔐', title: 'Sécurité', desc: 'La confiance est notre priorité absolue' },
              { icon: '👁️', title: 'Transparence', desc: 'Zéro compromis sur la clarté des processus' },
              { icon: '⚖️', title: 'Équité', desc: 'Égalité des chances pour tous les participants' },
              { icon: '🚀', title: 'Innovation', desc: 'Technologie de pointe pour un avenir meilleur' },
            ].map((value, idx) => (
              <Grid key={idx} sx={{ flex: { xs: "1 1 100%", sm: "1 1 50%", md: "1 1 25%" } }}>
                <Card className="about-value-card">
                  <CardContent className="about-value-content">
                    <Typography className="about-value-emoji">{value.icon}</Typography>
                    <Typography variant="h4" className="about-value-title">
                      {value.title}
                    </Typography>
                    <Typography className="about-value-text">
                      {value.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        <Box className="about-team-section">
          <Typography variant="h2" className="about-section-title">
            👥 L'Équipe Dirigeante
          </Typography>

          <Grid container spacing={2}>
            {[
              { name: 'Mohamed Dhaoui', role: 'Fondateur & Directeur Général', bio: 'Entrepreneur tunisien avec 15 ans d\'expérience en technologie' },
              { name: 'Fatima Belgacem', role: 'Directrice Technique', bio: 'Experte en sécurité informatique et blockchain' },
              { name: 'Karim Mansouri', role: 'Directeur Juridique', bio: 'Spécialiste des marchés publics et du droit commercial' },
              { name: 'Leila Saibi', role: 'Directrice du Développement', bio: 'Expert en partenariats publics-privés' },
            ].map((member, idx) => (
              <Grid key={idx} sx={{ flex: { xs: "1 1 100%", md: "1 1 50%" } }}>
                <Card className="about-team-card">
                  <CardContent className="about-team-content">
                    <Box className="about-team-avatar">👨‍💼</Box>
                    <Box className="about-team-info">
                      <Typography variant="h4" className="about-team-name">
                        {member.name}
                      </Typography>
                      <Typography className="about-team-role">
                        {member.role}
                      </Typography>
                      <Typography className="about-team-bio">
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
