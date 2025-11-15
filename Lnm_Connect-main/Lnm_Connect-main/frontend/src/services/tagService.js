import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * User Tag Service
 * Handles all API calls related to user tags/mentions
 */
export const tagService = {
  /**
   * Create tags for mentioned users in content
   */
  createTags: async (taggerUserId, taggedUserIds, contentId, contentType, content) => {
    const response = await axios.post(`${API_BASE_URL}/tags`, {
      taggerUserId,
      taggedUserIds,
      contentId,
      contentType,
      content
    });
    return response.data;
  },

  /**
   * Get all tags for a user
   */
  getTagsForUser: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/tags/user/${userId}`);
    return response.data;
  },

  /**
   * Get unread tags for a user
   */
  getUnreadTags: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/tags/user/${userId}/unread`);
    return response.data;
  },

  /**
   * Get unread tags count
   */
  getUnreadCount: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/tags/user/${userId}/count`);
    return response.data.count;
  },

  /**
   * Mark tags as read
   */
  markAsRead: async (tagIds) => {
    const response = await axios.post(`${API_BASE_URL}/tags/mark-read`, {
      tagIds
    });
    return response.data;
  },

  /**
   * Extract user IDs from content with @mentions
   * Returns array of user IDs mentioned in the text
   */
  extractMentionedUserIds: (content, tags) => {
    if (!tags || tags.length === 0) return [];
    return tags.map(tag => tag.userId);
  }
};

export default tagService;
