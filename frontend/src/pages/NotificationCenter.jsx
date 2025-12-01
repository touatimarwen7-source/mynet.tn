import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from '../api/axiosConfig';
import institutionalTheme from '../theme/theme';

export default function NotificationCenter({ notifications, loading, unreadCount, fetchNotifications }) {
  const [error, setError] = useState(null);

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`);
      fetchNotifications(); // Re-fetch after marking as read
    } catch (err) {
    }
  };

  return (
    <Box sx={{ p: 3, direction: 'rtl' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Badge badgeContent={unreadCount} color="error">
          <Typography variant="h5" sx={{ color: institutionalTheme.palette.primary.main, fontWeight: 'bold' }}>
            🔔 مركز الإشعارات
          </Typography>
        </Badge>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {notifications.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#999', textAlign: 'center', py: 4 }}>
              لا توجد إشعارات جديدة
            </Typography>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                sx={{
                  mb: 2,
                  backgroundColor: notification.read_at ? '#fff' : '#f0f7ff',
                  borderLeft: `4px solid ${institutionalTheme.palette.primary.main}`,
                }}
              >
                <CardContent>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {notification.title || `ملحق جديد: ${notification.addendum_number}`}
                          </Typography>
                          {!notification.read_at && (
                            <Chip label="جديد" size="small" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            {notification.tender_title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', my: 1 }}>
                            {notification.tender_number}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            {new Date(notification.sent_at).toLocaleDateString('ar-TN')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {!notification.read_at && (
                    <Button
                      size="small"
                      onClick={() => markAsRead(notification.id)}
                      sx={{ mt: 1, color: institutionalTheme.palette.primary.main }}
                    >
                      تحديد كمقروء
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </List>
      )}
    </Box>
  );
}
