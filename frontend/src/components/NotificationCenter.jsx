/**
 * Enhanced Real-time Notification Center Component
 * Displays WebSocket notifications with proper styling
 */
import { THEME_COLORS } from './themeHelpers';
import React, { useState, useEffect } from 'react'; // Import useEffect
import {
  Box,
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearIcon from '@mui/icons-material/Clear';
import useWebSocket from '../hooks/useWebSocket';

const NotificationCenter = ({ userId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, clearNotifications, connected, removeNotification } = useWebSocket(userId);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Placeholder for actual fetching logic and isAuthenticated
  // In a real scenario, this would come from context or props
  const isAuthenticated = true; // Assuming user is authenticated for the purpose of this example
  const fetchNotifications = async () => {
    // This is a placeholder function. Replace with actual API call.
    console.log('Fetching notifications...');
  };


  useEffect(() => {
    let interval = null;
    let isMounted = true;

    const loadNotifications = async () => {
      if (isMounted && isAuthenticated) {
        try {
          await fetchNotifications();
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    };

    if (isAuthenticated) {
      loadNotifications();
      interval = setInterval(() => {
        if (isMounted) {
          loadNotifications();
        }
      }, 30000);
    }

    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, fetchNotifications]);


  return (
    <Box>
      {/* Notification Bell */}
      <IconButton onClick={handleClick} color="inherit">
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Connection Status */}
      <Chip
        icon={<span style={{ color: connected ? '#4CAF50' : '#f44336' }}>●</span>}
        label={connected ? 'En direct' : 'Hors ligne'}
        size="small"
        sx={{ ml: 1, fontWeight: 600 }}
      />

      {/* Notification Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 450, maxHeight: 500, overflow: 'auto', backgroundColor: '#fafafa' }}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              🔔 Notifications en Temps Réel
            </Typography>
            {notifications.length > 0 && (
              <Button startIcon={<ClearIcon />} onClick={clearNotifications} size="small">
                Effacer tout
              </Button>
            )}
          </Box>

          {notifications.length === 0 ? (
            <Typography
              sx={{ p: 3, textAlign: 'center', color: THEME_COLORS.textDisabled, fontSize: '13px' }}
            >
              ✨ Aucune notification
            </Typography>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notif) => (
                <ListItem
                  key={notif.id}
                  sx={{
                    borderBottom: '1px solid #e0e0e0',
                    backgroundColor: '#fff',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '18px', minWidth: '24px' }}>{notif.icon}</span>
                        <Box sx={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '13px',
                              color: THEME_COLORS.textPrimary,
                              marginBottom: '4px',
                            }}
                          >
                            {notif.title}
                          </div>
                          <div style={{ fontSize: '12px', color: THEME_COLORS.textSecondary }}>
                            {notif.message}
                          </div>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </Box>
  );
};

export default NotificationCenter;