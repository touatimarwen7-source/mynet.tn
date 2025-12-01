import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Popover,
  Box,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from '../api/axiosConfig'; // ✅ استخدام النسخة المُعدّة
import { useWebSocket } from '../contexts/WebSocketContext'; // 1. استيراد hook الـ WebSocket
import NotificationCenter from '../pages/NotificationCenter';
import institutionalTheme from '../theme/theme';

const Navbar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const socket = useWebSocket(); // 2. الحصول على كائن الـ socket
  const [anchorEl, setAnchorEl] = useState(null);

  // 1. جلب عدد الإشعارات غير المقروءة عند التحميل
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        // افترض أن لديك نقطة نهاية API لهذا الغرض
        const response = await axios.get('/api/notifications/unread-count');
        // توحيد استخدام camelCase
        setUnreadCount(response.data.unreadCount || 0);
      } catch (error) {
        // يمكنك التعامل مع الخطأ هنا، مثلاً طباعته في الكونسول
        console.error("Failed to fetch unread notifications count:", error);
      }
    };

    fetchUnreadCount(); // الجلب عند تحميل المكون لأول مرة
  }, []);

  // 3. الاستماع إلى الإشعارات الفورية من الخادم
  useEffect(() => {
    if (socket) {
      // استمع لحدث 'new_notification' الذي يرسله الخادم
      socket.on('new_notification', (notificationData) => {
        // يمكنك عرض إشعار منبثق هنا (toast)
        console.log('New notification received:', notificationData);
        // زيادة عدد الإشعارات غير المقروءة
        setUnreadCount((prevCount) => prevCount + 1);
      });

      return () => socket.off('new_notification'); // تنظيف المستمع عند إزالة المكون
    }
  }, [socket]);

  const handleNotificationClick = (event) => {
    // عند فتح القائمة، قم بجلب أحدث الإشعارات
    fetchLatestNotifications();
    setAnchorEl(event.currentTarget);
  };

  const fetchLatestNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await axios.get('/api/my-notifications');
      const fetchedNotifications = response.data.notifications || [];
      setNotifications(fetchedNotifications);
      // تحديث العدد غير المقروء من البيانات الجديدة
      setUnreadCount(fetchedNotifications.filter(n => !n.read_at).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: institutionalTheme.palette.primary.main }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            MyNet.tn
          </Typography>

          {/* 2. أيقونة الإشعارات مع شارة (Badge) */}
          <IconButton
            size="large"
            aria-label={`show ${unreadCount} new notifications`}
            color="inherit"
            onClick={handleNotificationClick}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* 3. القائمة المنسدلة (Popover) لعرض مركز الإشعارات */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: '400px', maxHeight: '500px' }}>
          <NotificationCenter 
            notifications={notifications} 
            loading={loadingNotifications}
            unreadCount={unreadCount}
            fetchNotifications={fetchLatestNotifications}
          />
        </Box>
      </Popover>
    </>
  );
};

export default Navbar;