import { Grid, Paper, Typography, Box } from '@mui/material';

export default function HomePageTestimonials() {
  const testimonials = [
    { text: 'MyNet.tn a révolutionné notre processus d\'achat. Plus de transparence, moins de papiers, et une meilleure gestion des fournisseurs.', author: '— Directeur des Achats, Entreprise Manufacturière' },
    { text: 'Accès à plus d\'opportunités commerciales. La plateforme est facile à utiliser et les outils d\'offres sont complets.', author: '— Responsable Commercial, PME de Fournitures' },
    { text: 'La sécurité et la conformité des données sont au cœur de MyNet.tn. Nous recommandons vivement cette plateforme.', author: '— Directeur Financier, Grande Entreprise' },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontSize: '20px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '24px' }}>
        Ce que Disent nos Utilisateurs
      </Typography>
      <Grid container spacing={2}>
        {testimonials.map((testimonial, idx) => (
          <Grid size={{ xs: 12, md: 4 }} key={idx}>
            <Paper sx={{ padding: '24px', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '8px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontSize: '14px', color: theme.palette.text.primary, marginBottom: '12px', flex: 1, lineHeight: 1.6 }}>
                "{testimonial.text}"
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#616161', fontStyle: 'italic' }}>
                {testimonial.author}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
