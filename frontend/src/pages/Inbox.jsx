import { useState, useEffect } from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  TextField,
  InputAdornment,
} from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { setPageTitle } from '../utils/pageTitle';
import axiosInstance from '../services/axiosConfig';

export default function Inbox() {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ unread: 0, total: 0 });

  const limit = 15;

  useEffect(() => {
    setPageTitle('Boîte de Réception');
    fetchMessages();
    fetchStats();
  }, [page, unreadOnly]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/messaging/inbox', {
        params: {
          page,
          limit,
          unread_only: unreadOnly
        }
      });
      setMessages(response.data.data);
      setTotal(response.data.total);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/messaging/count/unread');
      setStats(prev => ({ ...prev, unread: response.data.unread_count }));
    } catch (err) {
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message?')) return;
    try {
      await axiosInstance.delete(`/messaging/${messageId}`);
      fetchMessages();
      setError('');
    } catch (err) {
      setError('Erreur lors de la suppression du message');
    }
  };

  const handleOpenMessage = (messageId, isRead) => {
    if (!isRead) {
      axiosInstance.put(`/messaging/${messageId}/read`).then(() => {
        fetchMessages();
        fetchStats();
      });
    }
    navigate(`/message/${messageId}`);
  };

  const filteredMessages = messages.filter(msg =>
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && messages.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f9f9f9', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '8px' }}>
              Boîte de Réception
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              {stats.unread} رسالة غير مقروءة
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/compose')}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            كتابة رسالة جديدة
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ marginBottom: '20px' }}>{error}</Alert>}

        <Card sx={{ marginBottom: '20px' }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <TextField
                fullWidth
                placeholder="البحث في الرسائل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
              <Button
                variant={unreadOnly ? 'contained' : 'outlined'}
                onClick={() => { setUnreadOnly(!unreadOnly); setPage(1); }}
                sx={{ backgroundColor: unreadOnly ? theme.palette.primary.main : 'transparent', color: unreadOnly ? 'white' : theme.palette.primary.main }}
              >
                غير مقروء
              </Button>
            </Box>
          </CardContent>
        </Card>

        {filteredMessages.length === 0 ? (
          <Alert severity="info">لا توجد رسائل</Alert>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>من</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>الموضوع</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>المحتوى</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>التاريخ</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow
                      key={message.id}
                      sx={{
                        backgroundColor: message.is_read ? 'white' : '#f0f7ff',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: message.is_read ? '#f5f5f5' : '#e8f3ff' },
                      }}
                      onClick={() => handleOpenMessage(message.id, message.is_read)}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {message.is_read ? (
                            <MailOutlineIcon sx={{ color: '#999', fontSize: '20px' }} />
                          ) : (
                            <MailIcon sx={{ color: theme.palette.primary.main, fontSize: '20px' }} />
                          )}
                          {message.sender_company}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: message.is_read ? 400 : 600 }}>
                        {message.subject || '(بدون موضوع)'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {message.content}
                      </TableCell>
                      <TableCell sx={{ fontSize: '12px', color: '#666' }}>
                        {new Date(message.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(message.id);
                          }}
                          sx={{ color: '#f44336' }}
                        >
                          حذف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {Math.ceil(total / limit) > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <Pagination
                  count={Math.ceil(total / limit)}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  sx={{ color: theme.palette.primary.main }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
