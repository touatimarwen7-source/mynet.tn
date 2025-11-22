import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem, Box } from '@mui/material';
import { useState } from 'react';
import LanguageIcon from '@mui/icons-material/Language';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const handleLanguageChange = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.lang = lng;
    document.documentElement.dir = 'ltr';
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button
        startIcon={<LanguageIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
      >
        {i18n.language === 'fr' ? 'FR' : i18n.language === 'ar' ? 'AR' : 'EN'}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {languages.map(lang => (
          <MenuItem key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
            <span style={{ marginRight: '8px' }}>{lang.flag}</span> {lang.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
