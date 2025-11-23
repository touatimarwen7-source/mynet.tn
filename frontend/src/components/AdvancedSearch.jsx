import { useState } from 'react';
import institutionalTheme from '../theme/theme';
import { useNavigate } from 'react-router-dom';
import institutionalTheme from '../theme/theme';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import institutionalTheme from '../theme/theme';

export default function AdvancedSearch() {
  const theme = institutionalTheme;
  const [category, setCategory] = useState('tous');
  const [keywords, setKeywords] = useState('');
  const [region, setRegion] = useState('all');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (keywords) params.append('q', keywords);
    if (region) params.append('region', region);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSearch}
      sx={{
        padding: '24px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: '4px',
        boxShadow: 'none',
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontSize: '16px',
              fontWeight: 600,
              color: theme.palette.text.primary,
              marginBottom: '16px',
            }}
          >
            Catégorie
          </Typography>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <FormControlLabel
                value="tous"
                control={<Radio />}
                label="Tous"
              />
              <FormControlLabel
                value="travaux"
                control={<Radio />}
                label="Travaux"
              />
              <FormControlLabel
                value="services"
                control={<Radio />}
                label="Services"
              />
              <FormControlLabel
                value="fournitures"
                control={<Radio />}
                label="Fournitures"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Mots clés ou Entreprise"
              placeholder="Ex: Plomberie, parking, etc..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: <SearchIcon sx={{ color: theme.palette.primary.main, marginRight: '8px' }} />,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Select
              fullWidth
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              displayEmpty
            >
              <MenuItem value="all">Toutes les régions</MenuItem>
              <MenuItem value="tunis">Tunis</MenuItem>
              <MenuItem value="ariana">Ariana</MenuItem>
              <MenuItem value="ben-arous">Ben Arous</MenuItem>
              <MenuItem value="manouba">Manouba</MenuItem>
              <MenuItem value="sousse">Sousse</MenuItem>
              <MenuItem value="sfax">Sfax</MenuItem>
              <MenuItem value="kairouan">Kairouan</MenuItem>
              <MenuItem value="kasserine">Kasserine</MenuItem>
              <MenuItem value="gafsa">Gafsa</MenuItem>
              <MenuItem value="tozeur">Tozeur</MenuItem>
              <MenuItem value="djerba">Djerba</MenuItem>
              <MenuItem value="gabes">Gabès</MenuItem>
              <MenuItem value="tataouine">Tataouine</MenuItem>
              <MenuItem value="medenine">Médenine</MenuItem>
              <MenuItem value="mahdia">Mahdia</MenuItem>
              <MenuItem value="monastir">Monastir</MenuItem>
              <MenuItem value="hammamet">Hammamet</MenuItem>
              <MenuItem value="nabeul">Nabeul</MenuItem>
              <MenuItem value="zaghouan">Zaghouan</MenuItem>
              <MenuItem value="bizerte">Bizerte</MenuItem>
              <MenuItem value="jendouba">Jendouba</MenuItem>
              <MenuItem value="kef">Kef</MenuItem>
              <MenuItem value="siliana">Siliana</MenuItem>
            </Select>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            startIcon={<SearchIcon />}
            sx={{
              padding: '10px 24px',
              backgroundColor: theme.palette.primary.main,
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Rechercher
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
