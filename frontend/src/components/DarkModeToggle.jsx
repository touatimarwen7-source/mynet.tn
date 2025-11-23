import { useContext } from 'react';
import { IconButton } from '@mui/material';
import { DarkModeContext } from '../contexts/DarkModeContext';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <IconButton
      onClick={toggleDarkMode}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      sx={{
        color: theme.palette.primary.main,
        '&:hover': {
          backgroundColor: '#f5f5f5'
        }
      }}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </IconButton>
  );
}
