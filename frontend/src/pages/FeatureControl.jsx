import { useState } from 'react';
import { Container, Box, Card, CardContent, Typography, List, ListItem, ListItemText, Switch, Stack, Alert, Chip } from '@mui/material';

export default function FeatureControl() {
  const [features, setFeatures] = useState([
    { id: 1, name: 'Appels d\'offres généraux', enabled: true, category: 'Core', description: 'Système principal d\'appels d\'offres' },
    { id: 2, name: 'Offres directes', enabled: true, category: 'Core', description: 'Requêtes d\'approvisionnement direct' },
    { id: 3, name: 'Système d\'enchères', enabled: false, category: 'Advanced', description: 'Enchères en temps réel' },
    { id: 4, name: 'Rapports avancés', enabled: true, category: 'Analytics', description: 'Rapports et analyses avancées' },
    { id: 5, name: 'Forum', enabled: false, category: 'Community', description: 'Espace de discussion' },
    { id: 6, name: 'API externe', enabled: false, category: 'Integration', description: 'Accès API pour intégrations' },
    { id: 7, name: 'Notifications SMS', enabled: true, category: 'Communication', description: 'Notifications par SMS' },
    { id: 8, name: 'Système de paiement', enabled: true, category: 'Payment', description: 'Intégration paiement' },
    { id: 9, name: 'Beta: Chat en temps réel', enabled: false, category: 'Beta', description: 'Chat instantané (en développement)' },
  ]);

  const [message, setMessage] = useState('');

  const handleToggle = (featureId) => {
    setFeatures(features.map(f =>
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    ));
    const feature = features.find(f => f.id === featureId);
    setMessage(`Fonctionnalité "${feature.name}" ${!feature.enabled ? 'activée' : 'désactivée'}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const categories = [...new Set(features.map(f => f.category))];
  const enabledCount = features.filter(f => f.enabled).length;

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#212121', marginBottom: '12px' }}>
            Contrôle des Fonctionnalités - Feature Control
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Gérer les fonctionnalités disponibles du système
          </Typography>

          {message && (
            <Alert severity="success" sx={{ marginBottom: '16px' }}>
              {message}
            </Alert>
          )}
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ marginBottom: '32px' }}>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Total des fonctionnalités
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0056B3' }}>
                {features.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Activées
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
                {enabledCount}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Désactivées
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#ff9800' }}>
                {features.length - enabledCount}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Features by Category */}
        {categories.map(category => (
          <Box key={category} sx={{ marginBottom: '32px' }}>
            {/* Category Header */}
            <Box sx={{
              padding: '12px 16px',
              backgroundColor: '#e3f2fd',
              borderLeft: '4px solid #0056B3',
              marginBottom: '16px',
              borderRadius: '4px',
            }}>
              <Typography sx={{ fontWeight: 700, color: '#0056B3', fontSize: '14px' }}>
                {category}
              </Typography>
            </Box>

            {/* Features List */}
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <List>
                  {features.filter(f => f.category === category).map(f => (
                    <ListItem
                      key={f.id}
                      secondaryAction={
                        <Switch
                          checked={f.enabled}
                          onChange={() => handleToggle(f.id)}
                          color="primary"
                        />
                      }
                      sx={{
                        paddingY: '16px',
                        borderBottom: '1px solid #f0f0f0',
                        '&:last-child': { borderBottom: 'none' },
                        opacity: f.enabled ? 1 : 0.6,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Typography sx={{ fontWeight: 600, color: '#212121' }}>
                              {f.name}
                            </Typography>
                            {f.category === 'Beta' && (
                              <Chip label="BETA" size="small" color="warning" variant="outlined" />
                            )}
                          </Box>
                        }
                        secondary={f.description}
                        secondaryTypographyProps={{ fontSize: '13px', color: '#666' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        ))}

        {/* Info */}
        <Alert severity="info" sx={{ marginTop: '24px' }}>
          💡 Conseil: Les changements de fonctionnalités sont appliqués immédiatement aux utilisateurs du système.
        </Alert>
      </Container>
    </Box>
  );
}
