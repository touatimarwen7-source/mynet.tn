import { Box, Button, Typography, Stack } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * Pagination Component
 * Provides page navigation with info display
 */
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 10,
  totalItems = 0 
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingY: '24px',
        backgroundColor: theme.palette.background.default,
        padding: '16px 24px',
        borderRadius: '4px',
        marginTop: '24px'
      }}
    >
      <Typography sx={{ fontSize: '13px', color: '#616161' }}>
        {totalItems > 0 
          ? `Affichage ${startItem}-${endItem} sur ${totalItems} éléments`
          : `Page ${currentPage} sur ${totalPages}`
        }
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          startIcon={<ChevronLeftIcon />}
          sx={{
            textTransform: 'none',
            color: currentPage === 1 ? '#ccc' : theme.palette.primary.main,
            '&:disabled': { color: '#ccc' }
          }}
        >
          Précédent
        </Button>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 16px'
          }}
        >
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            if (pageNum > totalPages) return null;
            
            const isActive = pageNum === currentPage;
            return (
              <Button
                key={pageNum}
                size="small"
                onClick={() => {
                  onPageChange(pageNum);
                  window.scrollTo(0, 0);
                }}
                sx={{
                  minWidth: '32px',
                  height: '32px',
                  padding: 0,
                  backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                  color: isActive ? '#FFFFFF' : theme.palette.primary.main,
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: isActive ? theme.palette.primary.main : '#f0f0f0'
                  }
                }}
              >
                {pageNum}
              </Button>
            );
          })}
        </Box>

        <Button
          size="small"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          endIcon={<ChevronRightIcon />}
          sx={{
            textTransform: 'none',
            color: currentPage === totalPages ? '#ccc' : theme.palette.primary.main,
            '&:disabled': { color: '#ccc' }
          }}
        >
          Suivant
        </Button>
      </Stack>
    </Box>
  );
}
