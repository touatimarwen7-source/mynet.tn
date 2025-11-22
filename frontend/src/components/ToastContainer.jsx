import { useState, useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import ToastNotification from './ToastNotification';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = idRef.current++;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <Box sx={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </Box>
  );
}
