import axios from 'axios';

// Base API URL
const API_BASE_URL = 'http://localhost:8080/api';

const recommendationService = {
  /**
   * Get profile recommendations for a user
   */
  getProfileRecommendations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations/profiles/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile recommendations:', error);
      throw error;
    }
  },

  /**
   * Get project recommendations for a user
   */
  getProjectRecommendations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations/projects/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project recommendations:', error);
      throw error;
    }
  },

  /**
   * Get event recommendations for a user
   */
  getEventRecommendations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations/events/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event recommendations:', error);
      throw error;
    }
  },

  /**
   * Get all recommendations at once
   */
  getAllRecommendations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recommendations/all/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all recommendations:', error);
      throw error;
    }
  },

  /**
   * Refresh recommendations for a user
   */
  refreshRecommendations: async (userId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/recommendations/refresh/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      throw error;
    }
  }
};

export default recommendationService;
