import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useSuperAdmin } from '../contexts/SuperAdminContext';

const FileManagement = () => {
  const { files, loadingFiles, uploadFile, deleteFile, fetchFiles, errorFiles } = useSuperAdmin();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      await uploadFile(formData);
      setOpenDialog(false);
      setSelectedFile(null);
      setFileName('');
      await fetchFiles();
    } catch (error) {
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('هل تريد حذف هذا الملف؟')) {
      try {
        await deleteFile(fileId);
        await fetchFiles();
      } catch (error) {
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileTypeColor = (mimeType) => {
    if (!mimeType) return 'default';
    if (mimeType.includes('pdf')) return 'error';
    if (mimeType.includes('image')) return 'success';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'info';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'warning';
    return 'default';
  };

  return (
    <Box sx={{ padding: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#212121' }}>
          إدارة الملفات
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': { backgroundColor: '#004399' },
            borderRadius: '4px',
            padding: '10px 20px',
          }}
        >
          رفع ملف جديد
        </Button>
      </Box>

      {errorFiles && (
        <Typography color="error" sx={{ marginBottom: '20px' }}>
          {errorFiles}
        </Typography>
      )}

      {loadingFiles ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ backgroundColor: 'white', borderRadius: '4px' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#F9F9F9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>اسم الملف</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>نوع الملف</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>الحجم</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>تاريخ الإنشاء</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>الإجراءات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files && files.length > 0 ? (
                files.map((file) => (
                  <TableRow key={file.id} sx={{ '&:hover': { backgroundColor: '#F9F9F9' } }}>
                    <TableCell sx={{ color: '#212121' }}>{file.name || file.file_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={file.file_type || 'ملف'}
                        color={getFileTypeColor(file.mime_type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#616161' }}>{formatFileSize(file.size_bytes)}</TableCell>
                    <TableCell sx={{ color: '#616161' }}>
                      {file.created_at ? new Date(file.created_at).toLocaleDateString('ar-TN') : '-'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: '8px' }}>
                        {file.url && (
                          <Tooltip title="تحميل">
                            <IconButton
                              size="small"
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ color: theme.palette.primary.main }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="حذف">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(file.id)}
                            sx={{ color: '#DC3545' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ padding: '40px', color: '#616161' }}>
                    لا توجد ملفات
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Upload Dialog */}
      <Dialog open={openDialog} onClose={() => !uploading && setOpenDialog(false)}>
        <DialogTitle sx={{ backgroundColor: theme.palette.primary.main, color: 'white', fontWeight: 'bold' }}>
          رفع ملف جديد
        </DialogTitle>
        <DialogContent sx={{ padding: '20px', minWidth: '400px' }}>
          <Box sx={{ marginTop: '20px' }}>
            <input
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" style={{ width: '100%' }}>
              <Button
                variant="outlined"
                component="span"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{
                  borderColor: '#0056B3',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: '#F0F5FF',
                    borderColor: '#0056B3',
                  },
                }}
              >
                اختر ملف
              </Button>
            </label>
            {selectedFile && (
              <TextField
                fullWidth
                label="اسم الملف"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                margin="normal"
                disabled
                variant="outlined"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '20px', gap: '10px' }}>
          <Button onClick={() => setOpenDialog(false)} disabled={uploading} sx={{ color: '#616161' }}>
            إلغاء
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            variant="contained"
            sx={{ backgroundColor: theme.palette.primary.main, color: 'white' }}
          >
            {uploading ? <CircularProgress size={24} /> : 'رفع'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileManagement;
