import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import StarIcon from '@mui/icons-material/Star';
import { useTenderAnalysis } from '../hooks/useTenderAnalysis';

/**
 * A component that displays the automated analysis report for a tender's offers.
 * @param {{ tenderId: string }} props
 */
const OfferAnalysisReport = ({ tenderId }) => {
  const { report, loading, error } = useTenderAnalysis(tenderId);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!report) {
    return <Alert severity="info">Le rapport d'analyse n'est pas encore disponible pour cet appel d'offres.</Alert>;
  }

  const { summary, priceComparisonData, complianceComparisonData, detailedComparison } = report;

  return (
    <Box sx={{ mt: 4, p: 3, backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Rapport d'Analyse Automatisé des Offres
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: 'success.light' }}>
            <CardContent>
              <Typography variant="h6">Meilleur Rapport Qualité/Prix</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{summary.bestValue.supplierName}</Typography>
              <Chip icon={<StarIcon />} label="Recommandé" color="success" size="small" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography>Prix le Plus Bas</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{summary.lowestPrice.supplierName}</Typography>
              <Typography>{new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(summary.lowestPrice.amount)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography>Score de Conformité le Plus Élevé</Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{summary.highestCompliance.supplierName}</Typography>
              <Typography>{summary.highestCompliance.score}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <Typography variant="h6" sx={{ mb: 2 }}>Comparaison des Prix</Typography>
          <Paper sx={{ p: 2, height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={priceComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toLocaleString('fr-TN')} TND`} />
                <Legend />
                <Bar dataKey="prix" fill="#8884d8" name="Prix Total de l'Offre" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Typography variant="h6" sx={{ mb: 2 }}>Comparaison de la Conformité</Typography>
          <Paper sx={{ p: 2, height: 300 }}>
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={complianceComparisonData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="criteria" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {summary.allSuppliers.map(supplier => (
                  <Radar key={supplier.id} name={supplier.name} dataKey={supplier.id} stroke={supplier.color} fill={supplier.color} fillOpacity={0.6} />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Comparison Table */}
      <Typography variant="h6" sx={{ mb: 2 }}>Tableau de Comparaison Détaillé</Typography>
      <Paper sx={{ overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Article</TableCell>
              {detailedComparison.suppliers.map(supplier => (
                <TableCell key={supplier.id} align="right"><strong>{supplier.name}</strong></TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {detailedComparison.items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.description}</TableCell>
                {detailedComparison.suppliers.map(supplier => (
                  <TableCell
                    key={supplier.id}
                    align="right"
                    sx={{ backgroundColor: item.prices[supplier.id]?.isLowest ? 'success.lighter' : 'inherit' }}
                  >
                    {item.prices[supplier.id] ? new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(item.prices[supplier.id].price) : 'N/A'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default OfferAnalysisReport;