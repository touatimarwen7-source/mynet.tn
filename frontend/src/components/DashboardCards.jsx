import { Box, Card, CardContent, Typography, LinearProgress, Stack, Chip } from '@mui/material';
import institutionalTheme from '../theme/theme';

export default function DashboardCards({ cards }) {
  const theme = institutionalTheme;
  const getStatusColor = (status) => {
    const statusMap = {
      active: 'success',
      pending: 'warning',
      warning: 'warning',
      error: 'error'
    };
    return statusMap[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      active: 'Actif',
      pending: 'En attente',
      warning: 'Attention',
      error: 'Critique'
    };
    return statusMap[status] || status;
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: '16px'
      }}
    >
      {cards.map((card, idx) => (
        <Card key={idx} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 500, color: '#616161' }}>
                {card.label}
              </Typography>
              
              <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                {card.value}
              </Typography>
              
              {card.subtitle && (
                <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                  {card.subtitle}
                </Typography>
              )}
              
              {card.status && (
                <Chip
                  label={getStatusLabel(card.status)}
                  color={getStatusColor(card.status)}
                  variant="outlined"
                  size="small"
                  sx={{ width: 'fit-content' }}
                />
              )}
              
              {card.progress !== undefined && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ marginBottom: '8px' }}>
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      Progress
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      {card.progress}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={card.progress}
                    sx={{
                      height: '8px',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
