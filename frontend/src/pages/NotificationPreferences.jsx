import { useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import { Container, Box, Card, CardContent, CardHeader, List, ListItem, ListItemText, Switch, Typography } from '@mui/material';
import { setPageTitle } from '../utils/pageTitle';

export default function NotificationPreferences() {
  const theme = institutionalTheme;
  const prefs = [
    { name: 'Notifications par courrier électronique', enabled: true },
    { name: 'Notifications par SMS', enabled: false },
    { name: 'Notifications de nouvelles offres', enabled: true },
    { name: 'Notifications de mise à jour du système', enabled: true },
    { name: 'Notifications de signalement d\'erreurs', enabled: false },
    { name: 'Résumé quotidien', enabled: true }
  ];

  useEffect(() => {
    setPageTitle('Préférences de notification');
  }, []);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Préférences de notification
        </Typography>
        <Card sx={{ border: '1px solid #E0E0E0' }}>
          <CardHeader title="Gérer les notifications" />
          <CardContent>
            <List>
              {prefs.map((p, idx) => (
                <ListItem key={idx} secondaryAction={<Switch checked={p.enabled} />}>
                  <ListItemText primary={p.name} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
