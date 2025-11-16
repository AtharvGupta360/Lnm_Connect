import axios from 'axios';

const API_URL = 'http://localhost:8080/api/notifications';

/**
 * Get notifications for a user with pagination
 */
export const getNotifications = async (userId, page = 0, size = 20) => {
  try {
    const response = await axios.get(`${API_URL}`, {
      params: { userId, page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/unread-count`, {
      params: { userId }
    });
    return response.data.count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    await axios.put(`${API_URL}/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId) => {
  try {
    await axios.put(`${API_URL}/mark-all-read`, null, {
      params: { userId }
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId, userId) => {
  try {
    await axios.delete(`${API_URL}/${notificationId}`, {
      params: { userId }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Create a test notification (for debugging)
 */
export const createTestNotification = async (userId, message) => {
  try {
    const response = await axios.post(`${API_URL}/test`, {
      userId,
      message
    });
    return response.data;
  } catch (error) {
    console.error('Error creating test notification:', error);
    throw error;
  }
};
