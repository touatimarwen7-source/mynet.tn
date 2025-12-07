
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function PremiumStatsCard({ 
  number, 
  label, 
  description, 
  trend, 
  icon: Icon = TrendingUpIcon,
  color = 'primary'
}) {
  const theme = useTheme();
  
  const colors = {
    primary: {
      bg: '#e3f2fd',
      text: theme.palette.primary.main,
    },
    success: {
      bg: '#e8f5e9',
      text: '#2e7d32',
    },
    warning: {
      bg: '#fff3e0',
      text: '#f57c00',
    },
    info: {
      bg: '#e1f5fe',
      text: '#0288d1',
    },
  };

  const colorScheme = colors[color] || colors.primary;

  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: colorScheme.text,
          boxShadow: `0 8px 24px ${colorScheme.text}15`,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography
              sx={{
                fontSize: '36px',
                fontWeight: 700,
                color: colorScheme.text,
                lineHeight: 1,
                mb: 1,
              }}
            >
              {number}
            </Typography>
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: theme.palette.text.primary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {label}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: colorScheme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color: colorScheme.text, fontSize: 24 }} />
          </Box>
        </Box>
        <Typography sx={{ fontSize: '13px', color: '#616161', lineHeight: 1.5 }}>
          {description}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: '#2e7d32', mr: 0.5 }} />
            <Typography sx={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
