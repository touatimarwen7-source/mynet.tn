import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Stack,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { TableSkeleton } from '../components/SkeletonLoader';
import { StatusBadge } from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

export default function EmailNotifications() {
  const theme = institutionalTheme;
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockEmails = [
        {
          id: 1,
          recipient: 'supplier@techcorp.tn',
          subject: 'Nouvelle offre disponible',
          template: 'new_tender',
          status: 'sent',
          sentAt: '2025-01-20 10:30',
          opens: 5,
        },
        {
          id: 2,
          recipient: 'buyer@company.tn',
          subject: 'Votre offre a été acceptée',
          template: 'offer_accepted',
          status: 'pending',
          sentAt: '2025-01-20 11:15',
          opens: 0,
        },
        {
          id: 3,
          recipient: 'admin@mynet.tn',
          subject: 'Rapport de livraison',
          template: 'delivery_report',
          status: 'sent',
          sentAt: '2025-01-20 09:00',
          opens: 12,
        },
      ];
      setEmails(mockEmails);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmails = emails.filter(email =>
    (email.recipient.toLowerCase().includes(filter.toLowerCase()) ||
     email.subject.toLowerCase().includes(filter.toLowerCase())) &&
    (!statusFilter || email.status === statusFilter)
  );

  const totalPages = Math.ceil(filteredEmails.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmails = filteredEmails.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
        <Container maxWidth="lg">
          <Typography sx={{ marginBottom: '24px', fontWeight: 600, color: theme.palette.primary.main }}>
            Notifications par Email
          </Typography>
          <TableSkeleton rows={5} columns={6} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: '32px' }}>
          Gestion des Notifications par Email
        </Typography>

        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Rechercher par destinataire ou sujet..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                variant="outlined"
                inputProps={{ 'aria-label': 'Rechercher les notifications' }}
              />
              <FormControl fullWidth>
                <InputLabel id="status-label">Filtrer par statut</InputLabel>
                <Select
                  labelId="status-label"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Filtrer par statut"
                >
                  <MenuItem value="">Tous les statuts</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="sent">Envoyée</MenuItem>
                  <MenuItem value="failed">Échouée</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </CardContent>
        </Card>

        <Paper sx={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Destinataire</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Sujet</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Date d'envoi</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Ouvertures</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.palette.text.primary }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmails.map((email) => (
                <TableRow key={email.id} hover>
                  <TableCell sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>{email.recipient}</TableCell>
                  <TableCell>{email.subject}</TableCell>
                  <TableCell>
                    <StatusBadge status={email.status} />
                  </TableCell>
                  <TableCell>{email.sentAt}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>{email.opens}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {email.status === 'pending' && (
                        <Button
                          size="small"
                          startIcon={<SendIcon />}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          Envoyer
                        </Button>
                      )}
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        sx={{ color: '#c62828' }}
                      >
                        Supprimer
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {paginatedEmails.length === 0 && (
          <Box sx={{ textAlign: 'center', paddingY: '40px' }}>
            <Typography sx={{ color: '#666' }}>
              Aucune notification trouvée
            </Typography>
          </Box>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredEmails.length}
          />
        )}
      </Container>
    </Box>
  );
}
