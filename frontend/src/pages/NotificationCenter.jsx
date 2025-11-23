import { useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { setPageTitle } from '../utils/pageTitle';

export default function NotificationCenter() {
  const notifications = [
    { id: 1, type: 'success', icon: <CheckCircleIcon sx={{ color: '#4caf50' }} />, title: 'Offre acceptée', message: 'Votre offre sur l\'appel d\'offres #1 a été acceptée', time: 'Il y a 1 heure' },
    { id: 2, type: 'warning', icon: <WarningIcon sx={{ color: '#ff9800' }} />, title: 'En attente de validation', message: 'Votre offre est en cours d\'examen', time: 'Il y a 2 heures' },
    { id: 3, type: 'info', icon: <InfoIcon sx={{ color: '#2196f3' }} />, title: 'Nouvel appel d\'offres', message: 'Un nouvel appel d\'offres est disponible', time: 'Il y a 1 jour' }
  ];

  useEffect(() => {
    setPageTitle('Centre de notifications');
  }, []);

  return (
    <Box sx={{ backgroundColor: theme.palette.background.default, paddingY: '40px', minHeight: '80vh' }}>
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 600, color: theme.palette.primary.main, mb: 3 }}>
          Centre de notifications
        </Typography>
        <Card sx={{ border: '1px solid #E0E0E0' }}>
          <CardContent>
            <List>
              {notifications.map((notif, idx) => (
                <Box key={notif.id}>
                  <ListItem>
                    <ListItemIcon>{notif.icon}</ListItemIcon>
                    <ListItemText
                      primary={notif.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ color: '#616161' }}>{notif.message}</Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>{notif.time}</Typography>
                        </Box>
                      }
                    />
                    <Button size="small" sx={{ color: theme.palette.primary.main }}>Supprimer</Button>
                  </ListItem>
                  {idx < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
