import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  LinearProgress,
  Stack,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import { setPageTitle } from '../utils/pageTitle';

export default function BudgetManagement() {
  const [budgets, setBudgets] = useState([
    { id: 1, name: 'Budget Fournitures', total: 50000, spent: 32500, remaining: 17500, category: 'Fournitures', year: 2025 },
    { id: 2, name: 'Budget Services', total: 80000, spent: 45000, remaining: 35000, category: 'Services', year: 2025 },
    { id: 3, name: 'Budget Construction', total: 150000, spent: 89500, remaining: 60500, category: 'Construction', year: 2025 }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newBudget, setNewBudget] = useState({ name: '', total: '', category: '' });

  useEffect(() => {
    setPageTitle('Gestion des Budgets');
  }, []);

  const handleAddBudget = () => {
    if (newBudget.name && newBudget.total) {
      setBudgets([...budgets, {
        id: budgets.length + 1,
        name: newBudget.name,
        total: parseFloat(newBudget.total),
        spent: 0,
        remaining: parseFloat(newBudget.total),
        category: newBudget.category,
        year: 2025
      }]);
      setNewBudget({ name: '', total: '', category: '' });
      setShowForm(false);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.total, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);

  const StatCard = ({ label, value, color }) => (
    <Card sx={{ border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ padding: '24px' }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#616161', marginBottom: '8px' }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: '24px', fontWeight: 600, color }}>
          {value.toLocaleString()} TND
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Box>
            <Typography variant="h2" sx={{ fontSize: '32px', fontWeight: 500, color: theme.palette.text.primary, marginBottom: '8px' }}>
              💰 Gestion des Budgets
            </Typography>
            <Typography sx={{ color: '#616161' }}>
              Suivez et gérez vos allocations budgétaires
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(!showForm)}
            sx={{
              backgroundColor: theme.palette.primary.main,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#0d47a1' },
            }}
          >
            Nouveau Budget
          </Button>
        </Box>

        {showForm && (
          <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
            <CardContent sx={{ padding: '24px' }}>
              <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '16px' }}>
                Créer un Nouveau Budget
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Nom du Budget"
                  value={newBudget.name}
                  onChange={(e) => setNewBudget({...newBudget, name: e.target.value})}
                />
                <TextField
                  fullWidth
                  label="Montant Total (TND)"
                  type="number"
                  value={newBudget.total}
                  onChange={(e) => setNewBudget({...newBudget, total: e.target.value})}
                />
                <FormControl fullWidth>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                    label="Catégorie"
                  >
                    <MenuItem value="Fournitures">Fournitures</MenuItem>
                    <MenuItem value="Services">Services</MenuItem>
                    <MenuItem value="Construction">Construction</MenuItem>
                    <MenuItem value="Conseil">Conseil</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="contained"
                    onClick={handleAddBudget}
                    sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
                  >
                    Ajouter
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setShowForm(false)}
                    startIcon={<CancelIcon />}
                    sx={{ color: theme.palette.primary.main, borderColor: theme.palette.primary.main }}
                  >
                    Annuler
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard label="Budget Total" value={totalBudget} color=theme.palette.primary.main />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard label="Total Dépensé" value={totalSpent} color="#f57c00" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard label="Restant" value={totalRemaining} color="#2e7d32" />
          </Grid>
        </Grid>

        <Card sx={{ border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          <Paper sx={{ border: 'none', borderRadius: 0 }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow sx={{ height: '56px' }}>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Nom du Budget</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Catégorie</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Dépensé</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Restant</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Utilisation</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {budgets.map(budget => {
                  const usage = (budget.spent / budget.total) * 100;
                  return (
                    <TableRow key={budget.id} sx={{ borderBottom: '1px solid #e0e0e0', '&:hover': { backgroundColor: '#fafafa' } }}>
                      <TableCell sx={{ color: theme.palette.text.primary }}>{budget.name}</TableCell>
                      <TableCell sx={{ color: '#616161' }}>{budget.category}</TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                        {budget.total.toLocaleString()} TND
                      </TableCell>
                      <TableCell align="right" sx={{ color: theme.palette.text.primary }}>
                        {budget.spent.toLocaleString()} TND
                      </TableCell>
                      <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                        {budget.remaining.toLocaleString()} TND
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <LinearProgress variant="determinate" value={usage} sx={{ flex: 1 }} />
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: theme.palette.text.primary, minWidth: '40px' }}>
                            {usage.toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" startIcon={<EditIcon />} sx={{ color: theme.palette.primary.main, textTransform: 'none' }}>
                          Éditer
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Card>
      </Container>
    </Box>
  );
}
