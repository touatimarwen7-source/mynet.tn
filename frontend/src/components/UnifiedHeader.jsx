import { THEME_COLORS } from './themeHelpers';
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  TextField,
  Menu,
  MenuItem,
  Avatar,
  Stack,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import TokenManager from '../services/tokenManager'; // Assuming this is the correct import path
import NotificationCenter from './NotificationCenter';
import institutionalTheme from '../theme/theme';

export default function UnifiedHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('Utilisateur');
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = institutionalTheme;

  // Initialize TokenManager
  const tokenManager = new TokenManager();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName('Utilisateur');
        return;
      }

      try {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        setIsAuthenticated(true);
        setUserRole(userData?.role || null);
        setUserName(userData?.username || userData?.email || 'Utilisateur');
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName('Utilisateur');
      }
    };

    checkAuth();
    window.addEventListener('authChanged', checkAuth);
    return () => window.removeEventListener('authChanged', checkAuth);
  }, []);

  const isPublicPage = ['/', '/about', '/features', '/pricing', '/contact'].includes(
    location.pathname
  );

  const publicLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'À Propos', href: '/about' },
    { label: 'Solutions', href: '/features' },
    { label: 'Tarification', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  const authenticatedLinks = [
    { label: "Appels d'Offres", href: '/tenders' },
    { label: 'Mon Profil', href: '/profile' },
  ];

  const shouldShowAuthLinks = isAuthenticated;
  const shouldShowPublicLinks = isPublicPage || !isAuthenticated;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.dispatchEvent(new Event('authChanged'));
    navigate('/login');
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const renderNavLinks = (links, isMobile = false) => {
    return links.map((link) => (
      <Button
        key={link.href}
        onClick={() => handleNavigate(link.href)}
        sx={{
          color:
            location.pathname === link.href
              ? theme.palette.primary.main
              : theme.palette.text.primary,
          fontWeight: location.pathname === link.href ? 600 : 500,
          textTransform: 'none',
          fontSize: '14px',
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: 'transparent',
          },
          borderBottom: location.pathname === link.href ? '2px solid #0056B3' : 'none',
          paddingBottom: '6px',
        }}
      >
        {link.label}
      </Button>
    ));
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: THEME_COLORS.bgPaper,
        color: theme.palette.text.primary,
        borderBottom: '1px solid #e0e0e0',
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <Box
          onClick={() => navigate('/')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            minWidth: '150px',
            fontSize: '24px',
            fontWeight: 600,
            color: theme.palette.primary.main,
            '&:hover': { color: '#0d47a1' },
          }}
        >
          <span style={{ fontSize: '28px' }}>🌐</span>
          <span>MyNet.tn</span>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '8px' }}>
          {shouldShowAuthLinks && renderNavLinks(authenticatedLinks)}
          {shouldShowPublicLinks && renderNavLinks(publicLinks)}
        </Box>

        {/* Search Bar */}
        {isAuthenticated && (
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            sx={{
              width: '200px',
              display: { xs: 'none', sm: 'block' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f5f5f5',
                '&:hover fieldset': { borderColor: '#bdbdbd' },
              },
            }}
            InputProps={{
              endAdornment: <SearchIcon sx={{ fontSize: 18, color: '#9e9e9e' }} />,
            }}
          />
        )}

        {/* Right Actions */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <>
              {/* Notification Center - Real-time Updates */}
              <NotificationCenter />

              <Box
                onClick={handleProfileMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: theme.palette.primary.main,
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: '80px' }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: theme.palette.text.primary }}
                  >
                    {userName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                    {userRole === 'buyer' ? 'Acheteur' : userRole === 'supplier' ? 'Fournisseur' : ''}
                  </Typography>
                </Box>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  sx: {
                    boxShadow: 'none',
                    border: '1px solid #e0e0e0',
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    navigate('/profile');
                    handleProfileMenuClose();
                  }}
                >
                  Paramètres
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    navigate('/security');
                    handleProfileMenuClose();
                  }}
                >
                  Sécurité
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: THEME_COLORS.errorLight }}>
                  <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
                  Se Déconnecter
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: '#e0e0e0',
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                Connexion
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: '#0d47a1',
                  },
                }}
              >
                Inscription
              </Button>
            </Stack>
          )}
        </Box>

        {/* Mobile Menu Button */}
        <IconButton
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          sx={{ display: { xs: 'flex', md: 'none' }, color: theme.palette.text.primary }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Mobile Menu */}
      <Drawer
        anchor="top"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { marginTop: '64px' } }}
      >
        <Box sx={{ width: '100%', padding: '16px', backgroundColor: THEME_COLORS.bgPaper }}>
          <List>
            {shouldShowAuthLinks &&
              authenticatedLinks.map((link) => (
                <ListItem
                  button
                  key={link.href}
                  onClick={() => handleNavigate(link.href)}
                  sx={{
                    backgroundColor: location.pathname === link.href ? '#e3f2fd' : 'transparent',
                    color:
                      location.pathname === link.href
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                    borderLeft: location.pathname === link.href ? '4px solid #0056B3' : 'none',
                  }}
                >
                  <ListItemText primary={link.label} />
                </ListItem>
              ))}
            {shouldShowPublicLinks &&
              publicLinks.map((link) => (
                <ListItem
                  button
                  key={link.href}
                  onClick={() => handleNavigate(link.href)}
                  sx={{
                    backgroundColor: location.pathname === link.href ? '#e3f2fd' : 'transparent',
                    color:
                      location.pathname === link.href
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                    borderLeft: location.pathname === link.href ? '4px solid #0056B3' : 'none',
                  }}
                >
                  <ListItemText primary={link.label} />
                </ListItem>
              ))}
          </List>

          {isAuthenticated ? (
            <Stack gap={1} sx={{ marginTop: '16px' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
              >
                Profil
              </Button>
              <Button fullWidth variant="contained" color="error" onClick={handleLogout}>
                Se Déconnecter
              </Button>
            </Stack>
          ) : (
            <Stack gap={1} sx={{ marginTop: '16px' }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
              >
                Connexion
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
              >
                Inscription
              </Button>
            </Stack>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}