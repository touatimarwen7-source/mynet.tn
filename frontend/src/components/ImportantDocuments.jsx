import { Box, Card, CardContent, Typography, Stack, Chip, Link } from '@mui/material';
import institutionalTheme from '../theme/theme';

export default function ImportantDocuments({ documents, title = 'Documents Importants' }) {
  const theme = institutionalTheme;
  if (!documents || documents.length === 0) {
    return (
      <Box sx={{ padding: '24px', backgroundColor: theme.palette.background.default, borderRadius: '4px' }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '16px' }}>
          {title}
        </Typography>
        <Typography sx={{ color: '#616161', fontSize: '14px' }}>
          ✓ Aucun document en attente
        </Typography>
      </Box>
    );
  }

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: '#c62828',
      medium: '#f57c00',
      normal: '#2e7d32'
    };
    return colorMap[priority] || '#616161';
  };

  const getPriorityLabel = (priority) => {
    const labelMap = {
      high: 'Urgent',
      medium: 'Important',
      normal: 'Normal'
    };
    return labelMap[priority] || 'Normal';
  };

  return (
    <Box sx={{ padding: '24px' }}>
      <Typography sx={{ fontSize: '16px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '20px' }}>
        {title}
      </Typography>

      <Stack spacing={2}>
        {documents.map((doc, idx) => (
          <Card key={idx} sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
            <CardContent sx={{ padding: '20px' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" sx={{ marginBottom: '12px' }}>
                <Box sx={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <Typography sx={{ fontSize: '24px' }}>{doc.icon}</Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, fontSize: '14px' }}>
                      {doc.title}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#616161' }}>
                      {doc.meta}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={getPriorityLabel(doc.priority)}
                  sx={{
                    backgroundColor: getPriorityColor(doc.priority),
                    color: '#FFFFFF',
                    height: '24px',
                    alignSelf: 'flex-start'
                  }}
                />
              </Stack>

              {doc.details && (
                <Typography sx={{ fontSize: '13px', color: '#616161', marginBottom: '12px', lineHeight: 1.6 }}>
                  {doc.details}
                </Typography>
              )}

              {doc.action && (
                <Link
                  href={doc.action.path}
                  sx={{
                    fontSize: '13px',
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {doc.action.label} →
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
