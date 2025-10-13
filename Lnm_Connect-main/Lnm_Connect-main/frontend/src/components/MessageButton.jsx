import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/chatService';

/**
 * Button component to start a chat from a user's profile
 * Usage: <MessageButton targetUserId={userId} targetUserName={userName} />
 */
const MessageButton = ({ targetUserId, targetUserName, targetUserPhotoUrl, className = '' }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Get current user from localStorage (your existing auth system)
  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const user = getCurrentUser();
  const currentUserId = user?.id || user?._id || localStorage.getItem('userId');

  const handleStartChat = async () => {
    if (currentUserId === targetUserId) {
      alert("You can't message yourself!");
      return;
    }

    try {
      setLoading(true);
      
      // Get or create chat room
      const chatRoomId = await chatService.getChatRoom(currentUserId, targetUserId);
      
      // Navigate to chat page with pre-selected conversation
      navigate('/chat', {
        state: {
          chatRoomId,
          otherUserId: targetUserId,
          otherUserName: targetUserName,
          otherUserPhotoUrl: targetUserPhotoUrl
        }
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <MessageCircle className="w-5 h-5" />
      <span>{loading ? 'Loading...' : 'Message'}</span>
    </button>
  );
};

export default MessageButton;
