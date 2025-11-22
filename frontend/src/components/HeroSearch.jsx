import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Paper,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function HeroSearch() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tenders');
  const [searchData, setSearchData] = useState({
    category: 'tous',
    keywords: '',
    region: 'all',
    type: 'tenders'
  });

  const searchTabs = [
    { id: 'markets', label: 'Nouveaux Marchés' },
    { id: 'tenders', label: 'Appels d\'Offres' },
    { id: 'awards', label: 'Attributions' },
    { id: 'data', label: 'Données Essentielles' }
  ];

  const categories = [
    { value: 'tous', label: 'Tous' },
    { value: 'travaux', label: 'Travaux' },
    { value: 'services', label: 'Services' },
    { value: 'fournitures', label: 'Fournitures' }
  ];

  const regions = [
    { value: 'all', label: 'Ensemble du Territoire' },
    { value: 'tunis', label: 'Tunis' },
    { value: 'ariana', label: 'Ariana' },
    { value: 'ben-arous', label: 'Ben Arous' },
    { value: 'manouba', label: 'Manouba' },
    { value: 'nabeul', label: 'Nabeul' },
    { value: 'hammamet', label: 'Hammamet' },
    { value: 'sfax', label: 'Sfax' },
    { value: 'sousse', label: 'Sousse' },
    { value: 'monastir', label: 'Monastir' },
    { value: 'kairouan', label: 'Kairouan' },
    { value: 'kasserine', label: 'Kasserine' },
    { value: 'sidi-bouzid', label: 'Sidi Bouzid' },
    { value: 'gabes', label: 'Gabès' },
    { value: 'medenine', label: 'Médenine' },
    { value: 'tataouine', label: 'Tataouine' },
    { value: 'djerba', label: 'Djerba' },
    { value: 'tozeur', label: 'Tozeur' },
    { value: 'kebili', label: 'Kébili' },
    { value: 'douz', label: 'Douz' },
    { value: 'jendouba', label: 'Jendouba' },
    { value: 'beja', label: 'Béja' },
    { value: 'kef', label: 'Le Kef' },
    { value: 'siliana', label: 'Siliana' },
    { value: 'zaghouan', label: 'Zaghouan' }
  ];

  const getButtonText = () => {
    switch(activeTab) {
      case 'markets':
        return 'Effectuer la Recherche - Nouveaux Marchés';
      case 'tenders':
        return 'Effectuer la Recherche - Appels d\'Offres';
      case 'awards':
        return 'Effectuer la Recherche - Attributions';
      case 'data':
        return 'Effectuer la Recherche - Données Essentielles';
      default:
        return 'Effectuer la Recherche';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchData.keywords) params.append('q', searchData.keywords);
    if (searchData.category !== 'tous') params.append('category', searchData.category);
    if (searchData.region !== 'all') params.append('region', searchData.region);
    params.append('type', activeTab);
    
    const routeMap = {
      tenders: '/tenders',
      awards: '/awards',
      markets: '/markets',
      data: '/data'
    };
    
    navigate(`${routeMap[activeTab]}?${params.toString()}`);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchData({ ...searchData, type: tabId });
  };

  const handleCategoryChange = (e) => {
    setSearchData({ ...searchData, category: e.target.value });
  };

  const handleKeywordsChange = (e) => {
    setSearchData({ ...searchData, keywords: e.target.value });
  };

  const handleRegionChange = (e) => {
    setSearchData({ ...searchData, region: e.target.value });
  };

  return (
    <Paper elevation={0} sx={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1}>
          {searchTabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'contained' : 'outlined'}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        <Box component="form" onSubmit={handleSearch}>
          <Stack spacing={2}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Catégorie</FormLabel>
              <RadioGroup
                row
                value={searchData.category}
                onChange={handleCategoryChange}
              >
                {categories.map(cat => (
                  <FormControlLabel
                    key={cat.value}
                    value={cat.value}
                    control={<Radio />}
                    label={cat.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label="Mots-clés ou Entreprise"
                placeholder="Exemple: Construction, Informatique, Services"
                value={searchData.keywords}
                onChange={handleKeywordsChange}
                variant="outlined"
                fullWidth
                InputProps={{
                  endAdornment: <SearchIcon />,
                }}
              />

              <Select
                value={searchData.region}
                onChange={handleRegionChange}
                displayEmpty
              >
                {regions.map(region => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.label}
                  </MenuItem>
                ))}
              </Select>
            </Stack>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              startIcon={<SearchIcon />}
            >
              {getButtonText()}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
