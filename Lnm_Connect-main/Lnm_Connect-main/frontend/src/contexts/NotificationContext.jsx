import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as notificationService from '../services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const clientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const currentUserId = localStorage.getItem('userId');

  /**
   * Fetch initial notifications
   */
  const fetchNotifications = useCallback(async (page = 0, size = 20) => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(currentUserId, page, size);
      if (page === 0) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications(prev => [...prev, ...(data.notifications || [])]);
      }
      setUnreadCount(data.unreadCount || 0);
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      const count = await notificationService.getUnreadCount(currentUserId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [currentUserId]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      await notificationService.markAllAsRead(currentUserId);
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [currentUserId]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    if (!currentUserId) return;
    
    try {
      await notificationService.deleteNotification(notificationId, currentUserId);
      
      // Update local state
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [currentUserId]);

  /**
   * Add notification to local state (from WebSocket)
   */
  const addNotification = useCallback((notification) => {
    console.log('📥 Adding notification to state:', {
      id: notification.id,
      type: notification.type,
      receiverId: notification.receiverId,
      senderId: notification.senderId,
      senderName: notification.senderName,
      message: notification.message,
      currentUserId: currentUserId
    });
    
    // Verify this notification is for the current user
    if (notification.receiverId !== currentUserId) {
      console.error('❌ WRONG USER! Notification is for:', notification.receiverId, 'but current user is:', currentUserId);
      return; // Don't add notifications for other users
    }
    
    // Check if notification already exists to prevent duplicates
    setNotifications(prev => {
      const exists = prev.some(n => n.id === notification.id);
      if (exists) {
        console.log('⚠️ Notification already exists, skipping:', notification.id);
        return prev;
      }
      return [notification, ...prev];
    });
    
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, [currentUserId]);

  /**
   * Connect to WebSocket
   */
  const connectWebSocket = useCallback(() => {
    if (!currentUserId || clientRef.current?.active) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      
      connectHeaders: {
        userId: currentUserId
      },
      
      onConnect: () => {
        console.log('WebSocket connected for user:', currentUserId);
        setIsConnected(true);

        // Subscribe to user-specific notifications
        client.subscribe(`/user/queue/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          console.log('New notification received:', notification);
          addNotification(notification);
          
          // Play notification sound (optional)
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Audio play failed:', e));
        });

        // Subscribe to unread count updates
        client.subscribe(`/user/queue/unread-count`, (message) => {
          const count = JSON.parse(message.body);
          console.log('Unread count update:', count);
          setUnreadCount(count);
        });
      },

      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Auto-reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      },

      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
      },

      debug: (str) => {
        // Uncomment for debugging
        // console.log('STOMP debug:', str);
      }
    });

    clientRef.current = client;
    client.activate();
  }, [currentUserId, addNotification]);

  /**
   * Disconnect WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    if (currentUserId) {
      fetchNotifications();
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [currentUserId]); // Only reconnect if userId changes

  const value = {
    notifications,
    unreadCount,
    isConnected,
    loading,
    stompClient: clientRef.current,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    connectWebSocket,
    disconnectWebSocket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
