import { Box, Link } from '@mui/material';
import institutionalTheme from '../theme/theme';

export default function SkipLink() {
  const theme = institutionalTheme;
  return (
    <Link
      href="#main-content"
      sx={{
        position: 'absolute',
        top: '-40px',
        left: 0,
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
        padding: '8px 16px',
        zIndex: 1000,
        '&:focus': {
          top: 0
        }
      }}
    >
      Aller au contenu principal
    </Link>
  );
}
