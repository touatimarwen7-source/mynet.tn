import React from 'react';
import { Container, Box, Skeleton } from '@mui/material';

/**
 * 🚀 Optimized Loading Fallback
 * Better UX with skeleton UI instead of spinner
 * Reduces perceived load time
 */
export const LoadingFallback = () => (
  <Container maxWidth="lg" sx={{ py: 4 }}>
    <Box sx={{ space: 2 }}>
      {/* Header Skeleton */}
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3 }} />
      
      {/* Content Skeletons */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1, mb: 1 }} />
            <Skeleton variant="text" width="80%" sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        ))}
      </Box>
    </Box>
  </Container>
);

export const TableLoadingFallback = () => (
  <Container maxWidth="lg">
    <Box sx={{ space: 2 }}>
      <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" width="100%" height={50} sx={{ mb: 1 }} />
      ))}
    </Box>
  </Container>
);

export const FormLoadingFallback = () => (
  <Container maxWidth="sm">
    <Box sx={{ space: 2 }}>
      <Skeleton variant="text" width="50%" height={32} sx={{ mb: 3 }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <Box key={i} sx={{ mb: 2 }}>
          <Skeleton variant="text" width="20%" height={16} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={40} />
        </Box>
      ))}
      <Skeleton variant="rectangular" width="100%" height={44} />
    </Box>
  </Container>
);
