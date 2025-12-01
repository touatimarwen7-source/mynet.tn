import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext'; // لاستخدام معلومات المصادقة

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth(); // التحقق مما إذا كان المستخدم مسجلاً دخوله

  useEffect(() => {
    // 1. الاتصال فقط إذا كان المستخدم مسجلاً دخوله
    if (isAuthenticated) {
      // يجب أن يكون هذا الرابط هو رابط خادم الـ WebSocket الخاص بك
      // من الأفضل وضعه في متغيرات البيئة (environment variables)
      const newSocket = io(process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3001', {
        // إرسال التوكن للتحقق من هوية المستخدم في الخادم
        query: { token: localStorage.getItem('token') } 
      });

      setSocket(newSocket);

      // 2. تنظيف الاتصال عند تسجيل الخروج أو إغلاق الصفحة
      return () => {
        newSocket.close();
      };
    } else {
      // إذا قام المستخدم بتسجيل الخروج، أغلق الاتصال
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated]); // يعتمد على حالة تسجيل الدخول

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};