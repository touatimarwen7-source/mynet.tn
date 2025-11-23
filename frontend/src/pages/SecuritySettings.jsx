import { useEffect } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, Alert, List, ListItem, ListItemText, Divider } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import { setPageTitle } from '../utils/pageTitle';

export default function SecuritySettings() {
  const settings = [
    { title: 'Pare-feu', description: 'Protection avancée contre les attaques', status: 'Activé' },
    { title: 'Chiffrement', description: 'Chiffrage du protocole SSL/TLS', status: 'Activé' },
    { title: 'Authentification à deux facteurs', description: 'Sécurité avancée du compte', status: 'Activé' },
    { title: 'Journalisation des activités', description: 'Suivi de toutes les activités suspectes', status: 'Activé' }
  ];

  useEffect(() => {
    setPageTitle('Paramètres de sécurité');
  }, []);

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Paramètres de sécurité
        </Typography>

        <Alert severity="success" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <SecurityIcon sx={{ mr: 1 }} />
          Votre compte est protégé par des niveaux de sécurité élevés
        </Alert>

        <Card sx={{ border: '1px solid #E0E0E0' }}>
          <CardHeader title="Options de sécurité" />
          <CardContent>
            <List>
              {settings.map((setting, idx) => (
                <Box key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={setting.title}
                      secondary={setting.description}
                    />
                    <Typography sx={{ color: '#4caf50', fontWeight: 600, ml: 2 }}>
                      {setting.status}
                    </Typography>
                  </ListItem>
                  {idx < settings.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #E0E0E0', mt: 3 }}>
          <CardHeader title="Sessions actives" />
          <CardContent>
            <List>
              <ListItem>
                <ListItemText primary="Navigateur actuel" secondary="Dernière activité: Maintenant" />
                <Button size="small" sx={{ color: theme.palette.primary.main }}>Déconnecter</Button>
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
