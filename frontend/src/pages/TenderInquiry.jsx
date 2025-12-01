import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from '../api/axiosConfig'; // ✅ استخدام النسخة المُعدّة
import { theme } from '../theme/theme';

export default function TenderInquiry({ tenderId }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [responses, setResponses] = useState([]);
  const [newInquiry, setNewInquiry] = useState({
    subject: '',
    inquiry_text: '',
  });
  const [responseText, setResponseText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, [tenderId]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/tenders/${tenderId}/inquiries`);
      setInquiries(response.data.inquiries || []);
    } catch (err) {
      setError('فشل في تحميل الاستفسارات');
    } finally {
      setLoading(false);
    }
  };

  const submitInquiry = async () => {
    if (!newInquiry.subject || !newInquiry.inquiry_text) {
      setError('يرجى ملء جميع الحقول');
      return;
    }

    try {
      await axios.post(`/api/tenders/${tenderId}/inquiries`, newInquiry);
      setNewInquiry({ subject: '', inquiry_text: '' });
      fetchInquiries();
      setError(null);
    } catch (err) {
      setError('فشل في إرسال الاستفسار');
    }
  };

  const handleViewResponses = async (inquiry) => {
    setSelectedInquiry(inquiry);
    try {
      const response = await axios.get(`/api/inquiries/${inquiry.id}/responses`);
      setResponses(response.data.responses || []);
    } catch (err) {
    }
    setOpenDialog(true);
  };

  const submitResponse = async () => {
    if (!responseText) {
      setError('يرجى إدخال نص الرد');
      return;
    }

    try {
      await axios.post(`/api/inquiries/${selectedInquiry.id}/respond`, {
        response_text: responseText,
      });
      setResponseText('');
      setOpenDialog(false);
      fetchInquiries();
      setError(null);
    } catch (err) {
      setError('فشل في إرسال الرد');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      answered: 'success',
      closed: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      answered: 'تم الرد',
      closed: 'مغلق',
    };
    return labels[status] || status;
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Typography variant="h5" sx={{ mb: 3, color: theme.palette.primary.main, fontWeight: 'bold' }}>
        📋 الاستفسارات والتوضيحات
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Submit New Inquiry Form */}
      <Card sx={{ mb: 3, borderRadius: '4px' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            إرسال استفسار جديد
          </Typography>
          <TextField
            fullWidth
            label="الموضوع"
            value={newInquiry.subject}
            onChange={(e) => setNewInquiry({ ...newInquiry, subject: e.target.value })}
            margin="normal"
            variant="outlined"
            size="small"
          />
          <TextField
            fullWidth
            label="تفاصيل الاستفسار"
            value={newInquiry.inquiry_text}
            onChange={(e) => setNewInquiry({ ...newInquiry, inquiry_text: e.target.value })}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
          />
          <Button
            variant="contained"
            onClick={submitInquiry}
            sx={{ mt: 2, backgroundColor: theme.palette.primary.main }}
          >
            إرسال الاستفسار
          </Button>
        </CardContent>
      </Card>

      {/* Inquiries List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {inquiries.map((inquiry) => (
            <Paper key={inquiry.id} sx={{ mb: 2, p: 2 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {inquiry.subject}
                    </Typography>
                    <Chip
                      label={getStatusLabel(inquiry.status)}
                      color={getStatusColor(inquiry.status)}
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      من: {inquiry.company_name || inquiry.username}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {inquiry.inquiry_text}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        onClick={() => handleViewResponses(inquiry)}
                        sx={{ color: theme.palette.primary.main }}
                      >
                        عرض الردود ({inquiry.response_count || 0})
                      </Button>
                    </Box>
                  </Box>
                }
              />
            </Paper>
          ))}
        </List>
      )}

      {/* Response Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>الردود على الاستفسار</DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                {selectedInquiry.subject}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedInquiry.inquiry_text}
              </Typography>
              <Divider sx={{ my: 2 }} />

              {/* Existing Responses */}
              {responses.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    الردود الحالية:
                  </Typography>
                  {responses.map((response) => (
                    <Paper key={response.id} sx={{ p: 1.5, mb: 1, backgroundColor: '#f5f5f5' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {response.username}
                      </Typography>
                      <Typography variant="body2">{response.response_text}</Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {new Date(response.answered_at).toLocaleDateString('ar-TN')}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* Add Response Form */}
              <TextField
                fullWidth
                label="أضف ردك"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                variant="outlined"
                multiline
                rows={3}
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>إغلاق</Button>
          <Button onClick={submitResponse} variant="contained" sx={{ backgroundColor: theme.palette.primary.main }}>
            إرسال الرد
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
