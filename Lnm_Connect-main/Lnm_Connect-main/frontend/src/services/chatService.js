import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const chatService = {
  // Get all conversations for a user
  getUserConversations: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Get or create a chat room between two users
  getChatRoom: async (user1Id, user2Id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/room`, {
        params: { user1Id, user2Id }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting chat room:', error);
      throw error;
    }
  },

  // Get all messages in a chat room
  getChatRoomMessages: async (chatRoomId, userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chats/${chatRoomId}`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  sendMessage: async (senderId, receiverId, content, attachmentUrl = null) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chats/send`,
        {
          receiverId,
          content,
          attachmentUrl
        },
        {
          params: { senderId }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Mark messages as read
  markAsRead: async (chatRoomId, userId) => {
    try {
      await axios.put(`${API_BASE_URL}/chats/${chatRoomId}/read`, null, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  // Mark messages as delivered
  markAsDelivered: async (chatRoomId, userId) => {
    try {
      await axios.put(`${API_BASE_URL}/chats/${chatRoomId}/delivered`, null, {
        params: { userId }
      });
    } catch (error) {
      console.error('Error marking as delivered:', error);
      throw error;
    }
  },
};
