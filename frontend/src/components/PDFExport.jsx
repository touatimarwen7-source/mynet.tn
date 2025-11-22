import React, { useState } from 'react';
import { Button, Box, CircularProgress, Alert, Stack } from '@mui/material';
import axios from 'axios';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';

const PDFExport = ({ documentType, documentId, supplierId = null, startDate = null, endDate = null, isDraft = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEndpoint = () => {
    switch(documentType) {
      case 'tender': return `/api/documents/pdf/tender/${documentId}`;
      case 'offer': return `/api/documents/pdf/offer/${documentId}`;
      case 'award': return `/api/documents/pdf/award-certificate/${documentId}/${supplierId}`;
      case 'transactions': return `/api/documents/pdf/transactions/${supplierId}?start_date=${startDate}&end_date=${endDate}`;
      default: throw new Error('نوع المستند غير معروف');
    }
  };

  const getFileName = () => {
    switch(documentType) {
      case 'tender': return `tender_${documentId}.pdf`;
      case 'offer': return `offer_${documentId}.pdf`;
      case 'award': return `award_${documentId}_${supplierId}.pdf`;
      case 'transactions': return `transactions_${supplierId}.pdf`;
      default: return 'document.pdf';
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = getEndpoint();
      const response = await axios.get(endpoint, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('فشل تحميل المستند. حاول مرة أخرى.');
      console.error('Error exporting PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = getEndpoint();
      const response = await axios.get(endpoint, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      newWindow.addEventListener('load', () => { newWindow.print(); });
    } catch (err) {
      setError('فشل فتح المستند. حاول مرة أخرى.');
      console.error('Error printing PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress size={24} sx={{ marginRight: '12px' }} />
          <span>جاري تحضير المستند...</span>
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      <Stack direction="row" spacing={1}>
        <Button startIcon={<FileDownloadIcon />} onClick={handleExportPDF} disabled={loading} variant="contained">
          تصدير PDF
        </Button>
        <Button startIcon={<PrintIcon />} onClick={handlePrint} disabled={loading} variant="outlined">
          طباعة
        </Button>
      </Stack>
    </Stack>
  );
};

export default PDFExport;
