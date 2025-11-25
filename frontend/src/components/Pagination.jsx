import { THEME_COLORS } from './themeHelpers';
import { Box, Button, Typography, Stack } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import institutionalTheme from '../theme/theme';
import { validatePage, validateLimit } from '../utils/paginationValidator';

/**
 * Pagination Component
 * Provides page navigation with info display with validation
 */
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  itemsPerPage = 10,
  totalItems = 0 
}) {
  const theme = institutionalTheme;
  
  // Validate pagination parameters
  const validPage = validatePage(currentPage, totalPages);
  const validLimit = validateLimit(itemsPerPage);
  const validTotalPages = Math.max(1, parseInt(totalPages, 10) || 1);
  
  // Recalculate if validation changed values
  if (validPage !== currentPage && onPageChange) {
    onPageChange(validPage);
  }
  
  const startItem = (validPage - 1) * validLimit + 1;
  const endItem = Math.min(validPage * validLimit, totalItems);

  const handlePrevious = () => {
    if (validPage > 1) {
      const prevPage = validPage - 1;
      onPageChange(prevPage);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (validPage < validTotalPages) {
      const nextPage = validPage + 1;
      onPageChange(nextPage);
      window.scrollTo(0, 0);
    }
  };

  if (validTotalPages <= 1) return null;

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
      <Typography sx={{ fontSize: '13px', color: THEME_COLORS.textSecondary }}>
        {totalItems > 0 
          ? `Affichage ${startItem}-${endItem} sur ${totalItems} éléments`
          : `Page ${validPage} sur ${validTotalPages}`
        }
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          onClick={handlePrevious}
          disabled={validPage === 1}
          startIcon={<ChevronLeftIcon />}
          sx={{
            textTransform: 'none',
            color: validPage === 1 ? '#ccc' : theme.palette.primary.main,
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
          {Array.from({ length: Math.min(5, validTotalPages) }, (_, i) => {
            const pageNum = i + 1;
            if (pageNum > validTotalPages) return null;
            
            const isActive = pageNum === validPage;
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
          disabled={validPage === validTotalPages}
          endIcon={<ChevronRightIcon />}
          sx={{
            textTransform: 'none',
            color: validPage === validTotalPages ? '#ccc' : theme.palette.primary.main,
            '&:disabled': { color: '#ccc' }
          }}
        >
          Suivant
        </Button>
      </Stack>
    </Box>
  );
}
