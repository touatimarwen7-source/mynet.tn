import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import GppGoodIcon from '@mui/icons-material/GppGood';
import PaidIcon from '@mui/icons-material/Paid';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AddCardIcon from '@mui/icons-material/AddCard';
import theme from '../../theme/theme';

const StyledBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(5, 4),
  marginBottom: theme.spacing(4),
  color: theme.palette.primary.contrastText,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: theme.shadows[4],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
    gap: theme.spacing(3),
  },
}));

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  height: '100%',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.light,
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(1),
  width: 56,
  height: 56,
}));

const Homepage = () => {
  const features = [
    { icon: <AppRegistrationIcon />, title: 'Créer un compte', description: 'Créez votre compte personnel maintenant' },
    { icon: <AccountBalanceIcon />, title: 'Gestion des comptes', description: 'Gérez tous vos comptes bancaires facilement' },
    { icon: <CreditCardIcon />, title: 'Cartes de crédit', description: 'Obtenez des cartes de crédit adaptées à vos besoins' },
    { icon: <GppGoodIcon />, title: 'Haute sécurité', description: 'Nous garantissons la sécurité de vos données et de votre argent' },
    { icon: <PaidIcon />, title: 'Investissements', description: 'Investissez votre argent intelligemment avec nos options variées' },
    { icon: <MonetizationOnIcon />, title: 'Paiements rapides', description: 'Effectuez vos paiements rapidement et en toute sécurité' },
    { icon: <AddCardIcon />, title: 'Prêts', description: 'Obtenez des prêts pour répondre à vos besoins financiers' },
  ];

  return (
    <Box sx={{ padding: '24px', backgroundColor: theme.palette.background.default }}>
      <StyledBox>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Bienvenue dans votre portail financier complet
          </Typography>
          <Typography variant="h6" component="p" gutterBottom>
            Nous vous proposons des solutions financières intégrées pour gérer votre argent facilement et en toute sécurité.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            endIcon={<ArrowForwardIcon />}
            sx={{
              borderRadius: theme.shape.borderRadius,
              padding: theme.spacing(1.5, 3),
              fontWeight: theme.typography.h6.fontWeight,
              fontSize: theme.typography.h6.fontSize,
              textTransform: 'none',
              boxShadow: theme.shadows[2],
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'scale(1.05)',
              },
            }}
          >
            Commencer maintenant
          </Button>
        </Box>
      </StyledBox>

      <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 4 }}>
        Pourquoi nous choisir ?
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <FeatureBox>
              <IconWrapper>{feature.icon}</IconWrapper>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {feature.description}
              </Typography>
            </FeatureBox>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Homepage;