
import { useEffect, useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Stack,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { setPageTitle } from '../utils/pageTitle';
import teamManagementApi from '../api/teamManagementApi';
import institutionalTheme from '../theme/theme';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TeamManagement() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'member',
    department: '',
    position: '',
    is_active: true,
    permissions: {},
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setPageTitle('إدارة الفريق');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, statsRes] = await Promise.all([
        teamManagementApi.getTeamMembers(),
        teamManagementApi.getTeamStats(),
      ]);
      setMembers(membersRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      setMessage({ type: 'error', text: 'فشل تحميل البيانات' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        email: member.email,
        full_name: member.full_name,
        role: member.role,
        department: member.department || '',
        position: member.position || '',
        is_active: member.is_active,
        permissions: member.permissions || {},
      });
    } else {
      setEditingMember(null);
      setFormData({
        email: '',
        full_name: '',
        role: 'member',
        department: '',
        position: '',
        is_active: true,
        permissions: {},
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMember(null);
  };

  const handleSave = async () => {
    try {
      if (editingMember) {
        await teamManagementApi.updateTeamMember(editingMember.id, formData);
        setMessage({ type: 'success', text: 'تم تحديث العضو بنجاح' });
      } else {
        await teamManagementApi.addTeamMember(formData);
        setMessage({ type: 'success', text: 'تم إضافة العضو بنجاح' });
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'حدث خطأ' });
    }
  };

  const handleDelete = async (memberId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العضو؟')) {
      try {
        await teamManagementApi.removeTeamMember(memberId);
        setMessage({ type: 'success', text: 'تم حذف العضو بنجاح' });
        fetchData();
      } catch (error) {
        setMessage({ type: 'error', text: 'فشل حذف العضو' });
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {message.text && (
          <Alert
            severity={message.type}
            onClose={() => setMessage({ type: '', text: '' })}
            sx={{ mb: 3 }}
          >
            {message.text}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  إجمالي الأعضاء
                </Typography>
                <Typography variant="h4">{stats?.total_members || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  الأعضاء النشطون
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats?.active_members || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  المديرون
                </Typography>
                <Typography variant="h4">{stats?.managers || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  الأعضاء
                </Typography>
                <Typography variant="h4">{stats?.members || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Team Members Table */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                أعضاء الفريق
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => handleOpenDialog()}
              >
                إضافة عضو جديد
              </Button>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>الاسم</TableCell>
                    <TableCell>البريد الإلكتروني</TableCell>
                    <TableCell>الدور</TableCell>
                    <TableCell>القسم</TableCell>
                    <TableCell>المنصب</TableCell>
                    <TableCell>الحالة</TableCell>
                    <TableCell>الإجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        لا يوجد أعضاء في الفريق
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.full_name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={member.role === 'manager' ? 'مدير' : 'عضو'}
                            color={member.role === 'manager' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{member.department || '-'}</TableCell>
                        <TableCell>{member.position || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={member.is_active ? 'نشط' : 'غير نشط'}
                            color={member.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(member)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(member.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingMember ? 'تعديل عضو الفريق' : 'إضافة عضو جديد'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="البريد الإلكتروني"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingMember}
                required
              />
              <TextField
                label="الاسم الكامل"
                fullWidth
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
              <TextField
                label="الدور"
                select
                fullWidth
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="member">عضو</MenuItem>
                <MenuItem value="manager">مدير</MenuItem>
              </TextField>
              <TextField
                label="القسم"
                fullWidth
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              <TextField
                label="المنصب"
                fullWidth
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="نشط"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>إلغاء</Button>
            <Button onClick={handleSave} variant="contained">
              {editingMember ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
