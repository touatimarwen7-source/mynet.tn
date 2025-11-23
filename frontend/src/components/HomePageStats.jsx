import { Grid, Paper, Typography } from '@mui/material';
import institutionalTheme from '../theme/theme';

export default function HomePageStats() {
  const theme = institutionalTheme;
  const stats = [
    { number: '50M+', label: 'Dinars', description: 'Montants d\'appels d\'offres traités' },
    { number: '1,200+', label: 'Organisations', description: 'Acheteurs et fournisseurs' },
    { number: '15,000+', label: 'Appels d\'Offres', description: 'Publiés avec succès' },
    { number: '99.9%', label: 'Disponibilité', description: 'Infrastructure sécurisée' },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
          <Paper sx={{ padding: '32px 24px', textAlign: 'center', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <Typography sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, marginBottom: '8px' }}>
              {stat.number}
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '4px' }}>
              {stat.label}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#616161' }}>
              {stat.description}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
