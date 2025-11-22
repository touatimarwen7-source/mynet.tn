import { Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

export function SkeletonLoader({ width = '100%', height = '20px', count = 1 }) {
  return (
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
  );
}

export function CardSkeleton() {
  return (
    <Box sx={{ padding: '24px' }}>
      <Skeleton variant="text" width="70%" height="32px" sx={{ marginBottom: '16px' }} />
      <SkeletonLoader count={3} />
      <Skeleton variant="text" width="50%" height="16px" />
    </Box>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
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
  );
}

export function AvatarSkeleton() {
  return (
    <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" height="20px" sx={{ marginBottom: '8px' }} />
        <Skeleton variant="text" width="50%" height="16px" />
      </Box>
    </Box>
  );
}

export function FormSkeleton({ fields = 5 }) {
  return (
    <Box>
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i} sx={{ marginBottom: '20px' }}>
          <Skeleton variant="text" width="30%" height="16px" sx={{ marginBottom: '8px' }} />
          <Skeleton variant="rectangular" width="100%" height="40px" />
        </Box>
      ))}
      <Skeleton variant="rectangular" width="100%" height="44px" />
    </Box>
  );
}

export function HeroSkeleton() {
  return (
    <Box sx={{ padding: '48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
      <Box>
        <Skeleton variant="text" width="90%" height="32px" sx={{ marginBottom: '20px' }} />
        <SkeletonLoader count={4} />
      </Box>
      <Skeleton variant="rectangular" height="400px" sx={{ borderRadius: '12px' }} />
    </Box>
  );
}

export function ListSkeleton({ items = 3 }) {
  return (
    <Box>
      {Array.from({ length: items }).map((_, i) => (
        <Box key={i} sx={{ marginBottom: '16px', padding: '16px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
          <AvatarSkeleton />
        </Box>
      ))}
    </Box>
  );
}
