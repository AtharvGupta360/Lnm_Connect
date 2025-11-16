import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    setIsOpen(false);
    
    // Navigate based on notification type
    if (notification.type === 'NEW_MESSAGE') {
      // For DMs, navigate to chat with the sender
      navigate(`/chat?userId=${notification.senderId}`);
    } else if (notification.type === 'THREAD_REPLY' || notification.type === 'THREAD_MENTION') {
      // For thread notifications, navigate to thread detail
      navigate(`/threads/${notification.entityId}`);
    } else if (notification.type === 'NEW_FOLLOWER') {
      // For follower notifications, navigate to their profile
      navigate(`/profile/${notification.senderId}`);
    } else if (notification.type === 'FOLLOW_REQUEST') {
      // For follow requests, navigate to network requests page
      navigate('/network/requests');
    } else if (notification.actionUrl) {
      // For other types, use the actionUrl (fix old URLs)
      const url = notification.actionUrl.replace('/connections?tab=requests', '/network/requests');
      navigate(url);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TAG_IN_POST':
      case 'TAG_IN_COMMENT':
      case 'TAG_IN_REPLY':
        return '🏷️';
      case 'NEW_MESSAGE':
        return '💬';
      case 'NEW_COMMENT':
      case 'COMMENT_REPLY':
        return '💭';
      case 'POST_LIKE':
      case 'COMMENT_LIKE':
        return '❤️';
      case 'NEW_FOLLOWER':
        return '👤';
      case 'FOLLOW_REQUEST':
        return '🤝';
      case 'APPLICATION_STATUS':
        return '📋';
      case 'UPVOTE':
        return '⬆️';
      case 'THREAD_REPLY':
        return '🧵';
      case 'SYSTEM_ALERT':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* Connection indicator */}
        {!isConnected && (
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[32rem] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                View all
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        {notification.previewText && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.previewText}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Delete notification"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                See all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
