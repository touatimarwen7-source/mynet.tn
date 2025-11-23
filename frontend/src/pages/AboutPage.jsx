import { useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BalanceIcon from '@mui/icons-material/Balance';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { setPageTitle } from '../utils/pageTitle';

export default function AboutPage() {
  useEffect(() => {
    setPageTitle('À Propos de MyNet.tn');
  }, []);

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', paddingY: '0px' }}>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: '#FFFFFF',
          paddingY: '80px',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h1"
            sx={{
              fontSize: '48px',
              fontWeight: 700,
              marginBottom: '16px',
              lineHeight: 1.2,
            }}
          >
            À Propos de MyNet.tn
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '18px',
              fontWeight: 400,
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Transformez Votre Approvisionnement avec une Plateforme B2B Moderne et Sécurisée
          </Typography>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ paddingY: '80px' }}>
        {/* Story Section */}
        <Box sx={{ marginBottom: '80px' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#212121',
              marginBottom: '48px',
              textAlign: 'center',
            }}
          >
            Notre Histoire et Vision
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {/* Problem Card */}
            <Card
              sx={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ padding: '32px' }}>
                <Box sx={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#212121',
                    marginBottom: '12px',
                  }}
                >
                  Le Problème
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '14px',
                    color: '#616161',
                    lineHeight: 1.6,
                  }}
                >
                  En Tunisie, les processus d'approvisionnement B2B étaient
                  freinés par manque de transparence, absence de normes uniformes
                  et risques élevés de fraude. Les processus manuels ralentissaient
                  les décisions et réduisaient l'efficacité.
                </Typography>
              </CardContent>
            </Card>

            {/* Solution Card */}
            <Card
              sx={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ padding: '32px' }}>
                <Box sx={{ fontSize: '40px', marginBottom: '16px' }}>✨</Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#212121',
                    marginBottom: '12px',
                  }}
                >
                  Notre Solution
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '14px',
                    color: '#616161',
                    lineHeight: 1.6,
                  }}
                >
                  Une plateforme numérique sécurisée, transparente et conforme
                  aux standards internationaux. Utilisant l'IA, la blockchain
                  et les technologies modernes pour automatiser et améliorer les
                  processus.
                </Typography>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card
              sx={{
                flex: 1,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E0E0E0',
                borderRadius: '4px',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ padding: '32px' }}>
                <Box sx={{ fontSize: '40px', marginBottom: '16px' }}>🎯</Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#212121',
                    marginBottom: '12px',
                  }}
                >
                  Notre Vision
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '14px',
                    color: '#616161',
                    lineHeight: 1.6,
                  }}
                >
                  Être la plateforme de référence pour l'approvisionnement B2B en
                  Afrique du Nord où chaque entreprise a accès aux mêmes
                  opportunités commerciales et où la transparence prime.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* Values Section */}
        <Box sx={{ marginBottom: '80px' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#212121',
              marginBottom: '48px',
              textAlign: 'center',
            }}
          >
            Nos Valeurs Fondamentales
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            sx={{ flexWrap: 'wrap' }}
          >
            {[
              {
                icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
                title: 'Sécurité',
                desc: 'La confiance est notre priorité absolue avec chiffrement AES-256 et authentification 2FA',
              },
              {
                icon: <VisibilityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
                title: 'Transparence',
                desc: 'Zéro compromis sur la clarté des processus avec audit complet et historique complet',
              },
              {
                icon: <BalanceIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
                title: 'Équité',
                desc: 'Égalité des chances pour tous les participants dans un environnement juste',
              },
              {
                icon: <LightbulbIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
                title: 'Innovation',
                desc: 'Technologie de pointe pour un avenir meilleur et des processus plus efficaces',
              },
            ].map((value, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 9px)' },
                }}
              >
                <Card
                  sx={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    boxShadow: 'none',
                    height: '100%',
                  }}
                >
                  <CardContent sx={{ padding: '32px', textAlign: 'center' }}>
                    <Box sx={{ marginBottom: '16px' }}>{value.icon}</Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#212121',
                        marginBottom: '8px',
                      }}
                    >
                      {value.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '14px',
                        color: '#616161',
                        lineHeight: 1.6,
                      }}
                    >
                      {value.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Team Section */}
        <Box sx={{ marginBottom: '80px' }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#212121',
              marginBottom: '48px',
              textAlign: 'center',
            }}
          >
            L'Équipe Dirigeante
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {[
              {
                name: 'Mohamed Dhaoui',
                role: 'Fondateur & Directeur Général',
                bio: 'Entrepreneur tunisien avec 15 ans d\'expérience en technologie et innovation digitale',
              },
              {
                name: 'Fatima Belgacem',
                role: 'Directrice Technique',
                bio: 'Experte en sécurité informatique, blockchain et architectures distribuées',
              },
              {
                name: 'Karim Mansouri',
                role: 'Directeur Juridique',
                bio: 'Spécialiste du droit commercial B2B, conformité réglementaire et contrats d\'approvisionnement',
              },
              {
                name: 'Leila Saibi',
                role: 'Directrice du Développement',
                bio: 'Experte en partenariats B2B, relations d\'affaires et développement stratégique commercial',
              },
            ].map((member, idx) => (
              <Box key={idx} sx={{ flex: 1 }}>
                <Card
                  sx={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent sx={{ padding: '32px' }}>
                    <Box
                      sx={{
                        fontSize: '48px',
                        marginBottom: '16px',
                        textAlign: 'center',
                      }}
                    >
                      👨‍💼
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#212121',
                        marginBottom: '4px',
                        textAlign: 'center',
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '13px',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        marginBottom: '12px',
                        textAlign: 'center',
                      }}
                    >
                      {member.role}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '14px',
                        color: '#616161',
                        lineHeight: 1.6,
                        textAlign: 'center',
                      }}
                    >
                      {member.bio}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            backgroundColor: theme.palette.primary.main,
            borderRadius: '4px',
            padding: '48px',
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            Prêt à Rejoindre la Révolution?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: '16px',
              marginBottom: '32px',
              lineHeight: 1.6,
            }}
          >
            Rejoignez des centaines d'organisations qui font confiance à MyNet.tn
            pour transformer leurs processus d'approvisionnement
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#FFFFFF',
                color: theme.palette.primary.main,
                fontWeight: 600,
                padding: '12px 32px',
                fontSize: '16px',
                borderRadius: '4px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
              href="/register?role=buyer"
            >
              Je suis Acheteur
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#FFFFFF',
                color: '#FFFFFF',
                fontWeight: 600,
                padding: '12px 32px',
                fontSize: '16px',
                borderRadius: '4px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              href="/register?role=supplier"
            >
              Je suis Fournisseur
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
