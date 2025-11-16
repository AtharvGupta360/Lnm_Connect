import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications(0);
  }, []);

  const loadNotifications = async (pageNum) => {
    const data = await fetchNotifications(pageNum, 20);
    setHasMore(data?.hasMore || false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNotifications(nextPage);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
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

    if (days > 7) {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    }
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const groupNotificationsByDate = (notifications) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    notifications.forEach(notification => {
      const diff = now - notification.createdAt;
      
      if (diff < oneDayMs) {
        groups.today.push(notification);
      } else if (diff < 2 * oneDayMs) {
        groups.yesterday.push(notification);
      } else if (diff < 7 * oneDayMs) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'unread'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'read'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* Notifications */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-gray-500 text-lg">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today */}
            {groupedNotifications.today.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Today
                </h2>
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                  {groupedNotifications.today.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onDelete={handleDelete}
                      getIcon={getNotificationIcon}
                      getTimeAgo={getTimeAgo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Yesterday */}
            {groupedNotifications.yesterday.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Yesterday
                </h2>
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                  {groupedNotifications.yesterday.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onDelete={handleDelete}
                      getIcon={getNotificationIcon}
                      getTimeAgo={getTimeAgo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* This Week */}
            {groupedNotifications.thisWeek.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  This Week
                </h2>
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                  {groupedNotifications.thisWeek.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onDelete={handleDelete}
                      getIcon={getNotificationIcon}
                      getTimeAgo={getTimeAgo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Older */}
            {groupedNotifications.older.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                  Older
                </h2>
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
                  {groupedNotifications.older.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onDelete={handleDelete}
                      getIcon={getNotificationIcon}
                      getTimeAgo={getTimeAgo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationItem = ({ notification, onClick, onDelete, getIcon, getTimeAgo }) => {
  return (
    <div
      onClick={() => onClick(notification)}
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="text-3xl flex-shrink-0">
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-medium text-gray-900 mb-1">
            {notification.message}
          </p>
          {notification.previewText && (
            <p className="text-sm text-gray-600 mb-2">
              {notification.previewText}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {getTimeAgo(notification.createdAt)}
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => onDelete(e, notification.id)}
          className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
          aria-label="Delete notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full"></div>
      )}
    </div>
  );
};

export default NotificationsPage;
