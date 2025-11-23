import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, Typography, Alert } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function TeamPermissions() {
  const theme = institutionalTheme;
  useEffect(() => {
    setPageTitle('Page');
  }, []);

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '40px', textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '16px' }}>
              TeamPermissions
            </Typography>
            <Alert severity="success" sx={{ backgroundColor: '#e8f5e9', color: '#1b5e20', border: '1px solid #2e7d32' }}>
            </Alert>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
