import { useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, TextField, Button, Stack } from '@mui/material';

export default function ProfileInterestsTab({ interests: initialInterests, onUpdate }) {
  const [interests, setInterests] = useState(initialInterests);
  const [newInterest, setNewInterest] = useState('');

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
      onUpdate([...interests, newInterest]);
    }
  };

  const removeInterest = (index) => {
    const updated = interests.filter((_, i) => i !== index);
    setInterests(updated);
    onUpdate(updated);
  };

  return (
    <Card sx={{ border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ padding: '24px' }}>
        <Typography variant="h4" sx={{ fontSize: '18px', fontWeight: 600, color: '#212121', marginBottom: '16px' }}>
          Secteurs d'Intérêt
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {interests.length === 0 ? (
            <Typography sx={{ color: '#999', fontStyle: 'italic' }}>Aucun secteur défini</Typography>
          ) : (
            interests.map((interest, idx) => (
              <Chip key={idx} label={interest} onDelete={() => removeInterest(idx)} sx={{ backgroundColor: '#e3f2fd', color: theme.palette.primary.main }} />
            ))
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField size="small" placeholder="Ajouter un secteur..." value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addInterest()} />
          <Button variant="contained" onClick={addInterest} sx={{ backgroundColor: '#2e7d32', textTransform: 'none', fontWeight: 600 }}>
            Ajouter
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
