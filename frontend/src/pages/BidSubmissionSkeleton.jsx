import { Box, Container, Skeleton, Stack } from '@mui/material';

const BidSubmissionSkeleton = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <Container maxWidth="lg" sx={{ paddingY: '40px' }}>
      <Stack spacing={4}>
        <Box>
          <Skeleton variant="text" width={120} height={40} />
          <Skeleton variant="text" width="60%" height={48} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
        <Skeleton variant="rectangular" width="100%" height={118} />
        <Skeleton variant="rectangular" width="100%" height={200} />
        <Skeleton variant="rectangular" width="100%" height={150} />
        <Skeleton variant="rectangular" width="100%" height={150} />
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width="50%" height={44} />
          <Skeleton variant="rectangular" width="50%" height={44} />
        </Stack>
      </Stack>
    </Container>
  </Box>
);

export default BidSubmissionSkeleton;