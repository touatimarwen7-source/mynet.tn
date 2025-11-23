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
  TextField,
  Stack,
  Rating,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { TableSkeleton } from '../components/SkeletonLoader';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

export default function ReviewsList() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockReviews = [
        {
          id: 1,
          supplier: 'TechCorp TN',
          reviewer: 'Ahmed Ben Ali',
          rating: 4.5,
          title: 'Excellent service',
          comment: 'Très bonne qualité de livraison et respect des délais',
          date: '2025-01-15',
          verified: true,
          helpful: 12,
        },
        {
          id: 2,
          supplier: 'Supply Inc',
          reviewer: 'Fatima El Kharroubi',
          rating: 3,
          title: 'Satisfaisant mais peut s\'améliorer',
          comment: 'Produits de bonne qualité mais délai de livraison long',
          date: '2025-01-10',
          verified: true,
          helpful: 8,
        },
        {
          id: 3,
          supplier: 'Industrial Pro',
          reviewer: 'Mohamed Saïdi',
          rating: 5,
          title: 'Professionnel et fiable',
          comment: 'Service exemplaire, communication rapide et professionnelle',
          date: '2025-01-05',
          verified: true,
          helpful: 25,
        },
      ];
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.supplier.toLowerCase().includes(filter.toLowerCase()) ||
    review.reviewer.toLowerCase().includes(filter.toLowerCase()) ||
    review.title.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
        <Container maxWidth="lg">
          <Typography sx={{ marginBottom: '24px', fontWeight: 600, color: theme.palette.primary.main }}>
            Avis et Évaluations
          </Typography>
          <TableSkeleton rows={5} columns={6} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', paddingY: '40px' }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ marginBottom: '32px', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#212121' }}>
            Avis et Évaluations
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ backgroundColor: theme.palette.primary.main }}
          >
            Laisser un Avis
          </Button>
        </Stack>

        <Card sx={{ marginBottom: '32px', border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ padding: '24px' }}>
            <TextField
              fullWidth
              placeholder="Rechercher par fournisseur ou auteur..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              variant="outlined"
              inputProps={{ 'aria-label': 'Rechercher les avis' }}
            />
          </CardContent>
        </Card>

        <Stack spacing={2}>
          {paginatedReviews.map((review) => (
            <Card key={review.id} sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ padding: '24px' }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main, marginBottom: '8px' }}>
                        {review.supplier}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography sx={{ fontSize: '14px', color: '#666' }}>
                          {review.rating}/5
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<EditIcon />} sx={{ color: theme.palette.primary.main }}>
                        Modifier
                      </Button>
                      <Button size="small" startIcon={<DeleteIcon />} sx={{ color: '#c62828' }}>
                        Supprimer
                      </Button>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 600, marginBottom: '4px' }}>
                      {review.title}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#666' }}>
                      {review.comment}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ fontSize: '12px', color: '#999' }}>
                    <Typography>Par {review.reviewer}</Typography>
                    <Typography>•</Typography>
                    <Typography>{review.date}</Typography>
                    {review.verified && (
                      <>
                        <Typography>•</Typography>
                        <Chip label="Acheteur Vérifié" size="small" variant="outlined" sx={{ height: '20px' }} />
                      </>
                    )}
                  </Stack>

                  <Typography sx={{ fontSize: '12px', color: theme.palette.primary.main, cursor: 'pointer' }}>
                    👍 Utile ({review.helpful})
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {paginatedReviews.length === 0 && (
          <Box sx={{ textAlign: 'center', paddingY: '40px' }}>
            <Typography sx={{ color: '#666' }}>
              Aucun avis trouvé
            </Typography>
          </Box>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredReviews.length}
          />
        )}
      </Container>
    </Box>
  );
}
