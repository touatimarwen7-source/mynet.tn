import { useState, useEffect } from 'react';
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
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';
import { useSuperAdmin } from '../contexts/SuperAdminContext';

export default function AuditLogViewer() {
  const { auditLogs, loading, error, fetchAuditLogs } = useSuperAdmin();
  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = auditLogs.filter(log =>
    (filter === '' || 
     (log.description && log.description.toLowerCase().includes(filter.toLowerCase())) ||
     (log.action && log.action.toLowerCase().includes(filter.toLowerCase()))) &&
    (actionFilter === '' || (log.action && log.action === actionFilter)) &&
    (statusFilter === '' || log.status === statusFilter)
  );

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'Description', 'Status', 'IP Address'],
      ...filteredLogs.map(log => [
        log.created_at ? new Date(log.created_at).toLocaleString('ar-TN') : '',
        log.action || '',
        log.description || '',
        log.status || '',
        log.ip_address || '',
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().getTime()}.csv`;
    link.click();
  };

  const handleClearFilters = () => {
    setFilter('');
    setActionFilter('');
    setStatusFilter('');
  };

  const getStatusColor = (status) => {
    return status === 'success' ? '#4caf50' : '#d32f2f';
  };

  const getActionColor = (action) => {
    const colors = {
      'CREATE_PAGE': theme.palette.primary.main,
      'UPDATE_PAGE': '#ff9800',
      'DELETE_PAGE': '#d32f2f',
      'UPLOAD_FILE': '#2196f3',
      'DELETE_FILE': '#d32f2f',
      'CREATE_DOCUMENT': '#4caf50',
      'DELETE_DOCUMENT': '#d32f2f',
      'SEND_EMAIL': '#9c27b0',
      'UPDATE_USER_ROLE': '#ff9800',
      'BLOCK_USER': '#d32f2f',
      'UNBLOCK_USER': '#4caf50',
      'CREATE_BACKUP': '#00897b',
      'RESTORE_BACKUP': '#1976d2',
      'CREATE_PLAN': '#4caf50',
      'UPDATE_PLAN': '#ff9800',
    };
    return colors[action] || '#666';
  };

  const getActionLabel = (action) => {
    const labels = {
      'CREATE_PAGE': 'إنشاء صفحة',
      'UPDATE_PAGE': 'تعديل صفحة',
      'DELETE_PAGE': 'حذف صفحة',
      'UPLOAD_FILE': 'رفع ملف',
      'DELETE_FILE': 'حذف ملف',
      'CREATE_DOCUMENT': 'إنشاء مستند',
      'DELETE_DOCUMENT': 'حذف مستند',
      'SEND_EMAIL': 'إرسال بريد',
      'UPDATE_USER_ROLE': 'تغيير دور',
      'BLOCK_USER': 'حظر مستخدم',
      'UNBLOCK_USER': 'إلغاء حظر',
      'CREATE_BACKUP': 'إنشاء نسخة',
      'RESTORE_BACKUP': 'استرجاع نسخة',
      'CREATE_PLAN': 'إنشاء خطة',
      'UPDATE_PLAN': 'تعديل خطة',
    };
    return labels[action] || action;
  };

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ marginBottom: '32px' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, marginBottom: '12px' }}>
            سجل التدقيق الإداري - Audit Logs
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            تتبع شامل لجميع أنشطة النظام والتعديلات
          </Typography>

          {error && (
            <Typography color="error" sx={{ marginBottom: '16px' }}>
              {error}
            </Typography>
          )}

          {/* Filters */}
          <Stack direction="row" spacing={2} sx={{ marginBottom: '24px', flexWrap: 'wrap' }}>
            <TextField
              placeholder="ابحث عن إجراء أو وصف..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: '250px' }}
            />
            <TextField
              select
              label="الإجراء"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              size="small"
              sx={{ minWidth: '150px' }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="CREATE_PAGE">إنشاء صفحة</MenuItem>
              <MenuItem value="UPDATE_PAGE">تعديل صفحة</MenuItem>
              <MenuItem value="DELETE_PAGE">حذف صفحة</MenuItem>
              <MenuItem value="UPLOAD_FILE">رفع ملف</MenuItem>
              <MenuItem value="DELETE_FILE">حذف ملف</MenuItem>
              <MenuItem value="UPDATE_USER_ROLE">تغيير الدور</MenuItem>
              <MenuItem value="BLOCK_USER">حظر مستخدم</MenuItem>
              <MenuItem value="UNBLOCK_USER">إلغاء حظر</MenuItem>
            </TextField>
            <TextField
              select
              label="الحالة"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ minWidth: '150px' }}
            >
              <MenuItem value="">الكل</MenuItem>
              <MenuItem value="success">نجح</MenuItem>
              <MenuItem value="failure">فشل</MenuItem>
            </TextField>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters}>
              إعادة تعيين
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleExport} sx={{ backgroundColor: theme.palette.primary.main }}>
              تصدير
            </Button>
          </Stack>
        </Box>

        {/* Stats */}
        <Stack direction="row" spacing={2} sx={{ marginBottom: '24px' }}>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                إجمالي السجلات
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: theme.palette.primary.main }}>
                {filteredLogs.length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                نجح
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#4caf50' }}>
                {filteredLogs.filter(l => l.status === 'success').length}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ border: '1px solid #e0e0e0', flex: 1 }}>
            <CardContent>
              <Typography sx={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                أخطاء
              </Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#d32f2f' }}>
                {filteredLogs.filter(l => l.status === 'failure').length}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Box>
        ) : (
          <Paper sx={{ border: '1px solid #e0e0e0', overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>التاريخ والوقت</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>الإجراء</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>الوصف</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>الحالة</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>عنوان IP</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                      <TableCell sx={{ fontSize: '13px' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString('ar-TN') : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getActionLabel(log.action)}
                          size="small"
                          sx={{
                            backgroundColor: `${getActionColor(log.action)}20`,
                            color: getActionColor(log.action),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px', maxWidth: '300px', wordBreak: 'break-word' }}>
                        {log.description}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status === 'success' ? 'نجح' : 'فشل'}
                          size="small"
                          sx={{
                            backgroundColor: `${getStatusColor(log.status)}20`,
                            color: getStatusColor(log.status),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '13px' }}>{log.ip_address || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ padding: '40px', color: '#616161' }}>
                      لا توجد سجلات متطابقة
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
