import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';
import DynamicAdvertisement from '../components/DynamicAdvertisement';
import HeroSearch from '../components/HeroSearch';
import HomePageRoleCards from '../components/HomePageRoleCards';
import HomePageStats from '../components/HomePageStats';
import HomePageTestimonials from '../components/HomePageTestimonials';
import HomePageFeatures from '../components/HomePageFeatures';
import HomePageCTA from '../components/HomePageCTA';
import HowItWorks from '../components/HowItWorks';
import LeadGenerationForm from '../components/LeadGenerationForm';
import { Container } from '@mui/material';

export default function HomePage() {
  setPageTitle('Accueil');
  const navigate = useNavigate();

  const handleRoleClick = (role) => {
    setTimeout(() => navigate(`/register?role=${role}`), 300);
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa' }}>
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '60px',
        }}
      >
        <HeroSearch />
      </Box>

      <Box sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', paddingY: '40px' }}>
        <DynamicAdvertisement />
      </Box>

      <HomePageRoleCards onRoleClick={handleRoleClick} />

      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
          borderBottom: '1px solid #e0e0e0',
          paddingY: '60px',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ marginBottom: '48px' }}>
            <HomePageStats />
          </Box>
          <HomePageTestimonials />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ paddingY: '60px' }}>
        <HomePageFeatures />
      </Container>

      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          borderBottom: '1px solid #e0e0e0',
          paddingY: '60px',
        }}
      >
        <HowItWorks />
      </Box>

      <Box sx={{ backgroundColor: '#ffffff', paddingY: '60px' }}>
        <LeadGenerationForm />
      </Box>

      <HomePageCTA />
    </Box>
  );
}
