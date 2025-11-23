import { useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';
import { Grid, Card, CardActionArea, CardContent, Typography, Chip, Box } from '@mui/material';
import institutionalTheme from '../theme/theme';

export default function QuickActions({ actions }) {
  const theme = institutionalTheme;
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: '#c62828',
      medium: '#f57c00',
      normal: '#616161'
    };
    return colorMap[priority] || '#616161';
  };

  return (
    <Box sx={{ padding: '24px', backgroundColor: theme.palette.background.default, borderRadius: '4px' }}>
      <Typography sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '20px' }}>
        Actions Rapides
      </Typography>
      <Grid container spacing={2}>
        {actions.map((action, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
            <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px', height: '100%' }}>
              <CardActionArea onClick={() => handleActionClick(action)} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1, width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '14px', flex: 1 }}>
                      {action.label}
                    </Typography>
                    {action.badge && (
                      <Chip label={action.badge} size="small" color="primary" sx={{ marginLeft: '8px' }} />
                    )}
                  </Box>
                  <Typography sx={{ fontSize: '12px', color: '#616161' }}>
                    {action.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
