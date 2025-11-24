import React from 'react';
import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

/**
 * 🚀 Optimized Loading Skeletons
 * Memoized components to prevent unnecessary re-renders
 */

export const SkeletonLoader = React.memo(({ width = '100%', height = '20px', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        variant="rectangular"
        width={width}
        height={height}
        sx={{ marginBottom: '12px' }}
      />
    ))}
  </>
));

SkeletonLoader.displayName = 'SkeletonLoader';

export const CardSkeleton = React.memo(() => (
  <Box sx={{ padding: '24px' }}>
    <Skeleton variant="text" width="70%" height="32px" sx={{ marginBottom: '16px' }} />
    <SkeletonLoader count={3} />
    <Skeleton variant="text" width="50%" height="16px" />
  </Box>
));

CardSkeleton.displayName = 'CardSkeleton';

export const TableSkeleton = React.memo(({ rows = 5, columns = 4 }) => (
  <Table sx={{ width: '100%', marginBottom: '20px' }}>
    <TableHead>
      <TableRow>
        {Array.from({ length: columns }).map((_, i) => (
          <TableCell key={i}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <Skeleton variant="text" width="90%" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
));

TableSkeleton.displayName = 'TableSkeleton';

export const AvatarSkeleton = React.memo(() => (
  <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
    <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
    <Box sx={{ flex: 1 }}>
      <Skeleton variant="text" width="70%" height="20px" sx={{ marginBottom: '8px' }} />
      <Skeleton variant="text" width="50%" height="16px" />
    </Box>
  </Box>
));

AvatarSkeleton.displayName = 'AvatarSkeleton';

export const FormSkeleton = React.memo(({ fields = 5 }) => (
  <Box>
    {Array.from({ length: fields }).map((_, i) => (
      <Box key={i} sx={{ marginBottom: '20px' }}>
        <Skeleton variant="text" width="30%" height="16px" sx={{ marginBottom: '8px' }} />
        <Skeleton variant="rectangular" width="100%" height="40px" />
      </Box>
    ))}
    <Skeleton variant="rectangular" width="100%" height="44px" />
  </Box>
));

FormSkeleton.displayName = 'FormSkeleton';

export const HeroSkeleton = React.memo(() => (
  <Box sx={{ padding: '48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
    <Box>
      <Skeleton variant="text" width="90%" height="32px" sx={{ marginBottom: '20px' }} />
      <SkeletonLoader count={4} />
    </Box>
    <Skeleton variant="rectangular" height="400px" sx={{ borderRadius: '12px' }} />
  </Box>
));

HeroSkeleton.displayName = 'HeroSkeleton';

export const ListSkeleton = React.memo(({ items = 3 }) => (
  <Box>
    {Array.from({ length: items }).map((_, i) => (
      <Box key={i} sx={{ marginBottom: '16px', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <AvatarSkeleton />
      </Box>
    ))}
  </Box>
));

ListSkeleton.displayName = 'ListSkeleton';
