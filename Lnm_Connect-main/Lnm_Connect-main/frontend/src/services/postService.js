import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Post Service
 * Handles all API calls related to posts
 */
export const postService = {
  /**
   * Create a new post
   */
  createPost: async (postData) => {
    const response = await axios.post(`${API_BASE_URL}/posts`, postData);
    return response.data;
  },

  /**
   * Get all posts
   */
  getAllPosts: async (userId, page = 0, size = 10) => {
    const response = await axios.get(`${API_BASE_URL}/posts`, {
      params: { userId, page, size }
    });
    return response.data;
  },

  /**
   * Get post by ID
   */
  getPostById: async (postId) => {
    const response = await axios.get(`${API_BASE_URL}/posts/${postId}`);
    return response.data;
  },

  /**
   * Update post
   */
  updatePost: async (postId, postData) => {
    const response = await axios.put(`${API_BASE_URL}/posts/${postId}`, postData);
    return response.data;
  },

  /**
   * Delete post (author only)
   */
  deletePost: async (postId, userId) => {
    await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
      params: { userId }
    });
  },

  /**
   * Apply to a post
   */
  applyToPost: async (postId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/posts/${postId}/apply`, null, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Accept an application
   */
  acceptApplication: async (applicationId, ownerId) => {
    const response = await axios.post(`${API_BASE_URL}/posts/applications/${applicationId}/accept`, null, {
      params: { ownerId }
    });
    return response.data;
  },

  /**
   * Reject an application
   */
  rejectApplication: async (applicationId, ownerId) => {
    const response = await axios.post(`${API_BASE_URL}/posts/applications/${applicationId}/reject`, null, {
      params: { ownerId }
    });
    return response.data;
  },

  /**
   * Get popular projects
   */
  getPopularProjects: async (limit = 5) => {
    const response = await axios.get(`${API_BASE_URL}/posts/popular-projects`, {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get trending topics
   */
  getTrendingTopics: async () => {
    const response = await axios.get(`${API_BASE_URL}/posts/trending-topics`);
    return response.data;
  }
};

export default postService;
