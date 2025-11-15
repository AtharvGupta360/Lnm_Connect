import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Thread Service
 * Handles all API calls related to discussion threads
 */
export const threadService = {
  /**
   * Create a new thread
   */
  createThread: async (userId, spaceId, title, content, tags = []) => {
    const response = await axios.post(`${API_BASE_URL}/threads`, {
      userId,
      spaceId,
      title,
      content,
      tags
    });
    return response.data;
  },

  /**
   * Get all threads for a space
   */
  getThreadsBySpace: async (spaceId, userId) => {
    const response = await axios.get(`${API_BASE_URL}/threads/space/${spaceId}`, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Get thread by ID
   */
  getThreadById: async (threadId, userId) => {
    const response = await axios.get(`${API_BASE_URL}/threads/${threadId}`, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Update thread
   */
  updateThread: async (threadId, userId, title, content, tags) => {
    const response = await axios.put(`${API_BASE_URL}/threads/${threadId}`, {
      userId,
      title,
      content,
      tags
    });
    return response.data;
  },

  /**
   * Delete thread
   */
  deleteThread: async (threadId, userId) => {
    await axios.delete(`${API_BASE_URL}/threads/${threadId}`, {
      params: { userId }
    });
  },

  /**
   * Toggle pin status
   */
  togglePin: async (threadId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/threads/${threadId}/pin`, null, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Toggle lock status
   */
  toggleLock: async (threadId, userId) => {
    const response = await axios.post(`${API_BASE_URL}/threads/${threadId}/lock`, null, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Vote on a thread (value: 1 for upvote, -1 for downvote)
   */
  voteThread: async (userId, threadId, value) => {
    const response = await axios.post(`${API_BASE_URL}/threads/${threadId}/vote`, {
      userId,
      value
    });
    return response.data;
  },

  /**
   * Get user's vote on a thread
   */
  getUserVoteOnThread: async (userId, threadId) => {
    const response = await axios.get(`${API_BASE_URL}/threads/${threadId}/vote`, {
      params: { userId }
    });
    return response.data.userVote;
  },

  /**
   * Add a comment to a thread
   */
  addComment: async (userId, threadId, content, parentCommentId = null) => {
    const response = await axios.post(`${API_BASE_URL}/threads/${threadId}/comments`, {
      userId,
      content,
      parentCommentId
    });
    return response.data;
  },

  /**
   * Get all comments for a thread
   */
  getComments: async (threadId, userId) => {
    const response = await axios.get(`${API_BASE_URL}/threads/${threadId}/comments`, {
      params: { userId }
    });
    return response.data;
  },

  /**
   * Update a comment
   */
  updateComment: async (commentId, userId, content) => {
    const response = await axios.put(`${API_BASE_URL}/comments/${commentId}`, {
      userId,
      content
    });
    return response.data;
  },

  /**
   * Delete a comment
   */
  deleteComment: async (commentId, userId) => {
    await axios.delete(`${API_BASE_URL}/comments/${commentId}`, {
      params: { userId }
    });
  },

  /**
   * Vote on a comment (value: 1 for upvote, -1 for downvote)
   */
  voteComment: async (userId, commentId, value) => {
    const response = await axios.post(`${API_BASE_URL}/comments/${commentId}/vote`, {
      userId,
      value
    });
    return response.data;
  },

  /**
   * Get user's vote on a comment
   */
  getUserVoteOnComment: async (userId, commentId) => {
    const response = await axios.get(`${API_BASE_URL}/comments/${commentId}/vote`, {
      params: { userId }
    });
    return response.data.userVote;
  }
};
