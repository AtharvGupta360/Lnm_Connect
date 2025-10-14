import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/follow';

export const followService = {
  /**
   * Send follow/connect request to another user
   */
  async sendFollowRequest(currentUserId, targetUserId) {
    const response = await axios.post(
      `${API_BASE_URL}/${targetUserId}?userId=${currentUserId}`
    );
    return response.data;
  },

  /**
   * Accept a follow/connect request
   */
  async acceptRequest(requestId, userId) {
    const response = await axios.post(
      `${API_BASE_URL}/${requestId}/accept?userId=${userId}`
    );
    return response.data;
  },

  /**
   * Reject a follow/connect request
   */
  async rejectRequest(requestId, userId) {
    const response = await axios.post(
      `${API_BASE_URL}/${requestId}/reject?userId=${userId}`
    );
    return response.data;
  },

  /**
   * Unfollow or remove connection
   */
  async unfollowUser(currentUserId, targetUserId) {
    const response = await axios.delete(
      `${API_BASE_URL}/${targetUserId}?userId=${currentUserId}`
    );
    return response.data;
  },

  /**
   * Get follow status between two users
   */
  async getFollowStatus(currentUserId, targetUserId) {
    const response = await axios.get(
      `${API_BASE_URL}/status/${targetUserId}?userId=${currentUserId}`
    );
    return response.data;
  },

  /**
   * Get pending connection requests
   */
  async getPendingRequests(userId) {
    const response = await axios.get(`${API_BASE_URL}/requests?userId=${userId}`);
    return response.data;
  },

  /**
   * Get followers list
   */
  async getFollowers(userId) {
    const response = await axios.get(`${API_BASE_URL}/followers/${userId}`);
    return response.data;
  },

  /**
   * Get following list
   */
  async getFollowing(userId) {
    const response = await axios.get(`${API_BASE_URL}/following/${userId}`);
    return response.data;
  },

  /**
   * Get mutual connections list
   */
  async getConnections(userId) {
    const response = await axios.get(`${API_BASE_URL}/connections/${userId}`);
    return response.data;
  },

  /**
   * Get follower, following, and connection counts
   */
  async getUserCounts(userId) {
    const response = await axios.get(`${API_BASE_URL}/counts/${userId}`);
    return response.data;
  }
};
