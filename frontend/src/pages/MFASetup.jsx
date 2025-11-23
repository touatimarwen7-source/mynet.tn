import { useEffect, useState } from 'react';
import { Container, Box, Card, CardContent, CardHeader, Typography, Button, TextField, Alert, List, ListItem, ListItemText } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { setPageTitle } from '../utils/pageTitle';

export default function MFASetup() {
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    setPageTitle('Configuration de l\'authentification');
  }, []);

  return (
    <Box sx={{ backgroundColor: '#F9F9F9', paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Authentification à deux facteurs
        </Typography>

        <Card sx={{ border: '1px solid #E0E0E0', mb: 3 }}>
          <CardHeader title={mfaEnabled ? 'Authentification activée' : 'Activer l\'authentification à deux facteurs'} />
          <CardContent>
            {mfaEnabled ? (
              <Alert severity="success" sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1, color: '#4caf50' }} />
                L\'authentification à deux facteurs est activée avec succès
              </Alert>
            ) : (
              <Box>
                <Typography sx={{ mb: 2 }}>Utilisez une application d\'authentification (Google Authenticator, Authy) pour activer l\'authentification à deux facteurs:</Typography>
                <Box sx={{ backgroundColor: '#F5F5F5', p: 2, borderRadius: '8px', mb: 2, textAlign: 'center' }}>
                  <Typography sx={{ fontWeight: 600, mb: 1 }}>Code QR</Typography>
                  <Box sx={{ width: '200px', height: '200px', backgroundColor: '#FFF', margin: '0 auto', border: '2px solid #DDD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ color: '#999' }}>[Code QR]</Typography>
                  </Box>
                </Box>
                <TextField fullWidth label="Entrez le code d'authentification" variant="outlined" sx={{ mb: 2 }} />
                <Button variant="contained" fullWidth sx={{ backgroundColor: theme.palette.primary.main }} onClick={() => setMfaEnabled(true)}>
                  Confirmer et activer
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #E0E0E0' }}>
          <CardHeader title="Codes de sauvegarde" />
          <CardContent>
            <Alert severity="info" sx={{ mb: 2 }}>Conservez ces codes dans un endroit sûr à titre de sauvegarde:</Alert>
            <List>
              {['XXXX-XXXX-XXXX', 'YYYY-YYYY-YYYY', 'ZZZZ-ZZZZ-ZZZZ'].map((code, idx) => (
                <ListItem key={idx}>
                  <ListItemText primary={code} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
