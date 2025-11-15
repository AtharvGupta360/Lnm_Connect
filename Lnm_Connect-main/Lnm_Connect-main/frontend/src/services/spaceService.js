import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Space/Forum Service
 * Handles all API calls related to discussion spaces
 */
export const spaceService = {
  /**
   * Create a new space
   */
  createSpace: async (userId, name, description, rules = [], tags = []) => {
    const response = await axios.post(`${API_BASE_URL}/spaces`, {
      userId,
      name,
      description,
      rules,
      tags
    });
    return response.data;
  },

  /**
   * Get all spaces
   */
  getAllSpaces: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/spaces`, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Get space by ID
   */
  getSpaceById: async (spaceId, userId) => {
    const response = await axios.get(`${API_BASE_URL}/spaces/${spaceId}`, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Join a space
   */
  joinSpace: async (spaceId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/spaces/${spaceId}/join`, null, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Leave a space
   */
  leaveSpace: async (spaceId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/spaces/${spaceId}/leave`, null, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Get user's joined spaces
   */
  getUserSpaces: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/spaces/user/${userId}`);
    return response.data;
  }
};

export default spaceService;
