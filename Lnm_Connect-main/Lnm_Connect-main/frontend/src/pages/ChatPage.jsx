import React, { useState, useEffect } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import { useWebSocket } from '../hooks/useWebSocket';
import { chatService } from '../services/chatService';
import { useLocation } from 'react-router-dom';

const ChatPage = () => {
  // Get current user from localStorage (your existing auth system)
  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        return null;
      }
    }
    return null;
  };

  const user = getCurrentUser();
  const currentUserId = user?.id || user?._id || localStorage.getItem('userId') || 'demo-user-1';
  const currentUserName = user?.name || localStorage.getItem('userName') || 'Demo User';

  // Store userId in localStorage for chat components
  useEffect(() => {
    if (currentUserId && currentUserName) {
      localStorage.setItem('userId', currentUserId);
      localStorage.setItem('userName', currentUserName);
    }
  }, [currentUserId, currentUserName]);

  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [typingIndicator, setTypingIndicator] = useState(null);
  
  const {
    connected,
    subscribeToChatRoom,
    subscribeToTyping,
    sendTypingIndicator,
    unsubscribeFromChatRoom,
  } = useWebSocket(currentUserId);

  // Handle pre-selected conversation from navigation state
  useEffect(() => {
    if (location.state?.chatRoomId) {
      setSelectedChat({
        chatRoomId: location.state.chatRoomId,
        otherUserId: location.state.otherUserId,
        otherUserName: location.state.otherUserName,
        otherUserPhotoUrl: location.state.otherUserPhotoUrl
      });
    }
  }, [location.state]);

  // Handle chat selection
  const handleSelectChat = async (conversation) => {
    // Unsubscribe from previous chat room
    if (selectedChat) {
      unsubscribeFromChatRoom(selectedChat.chatRoomId);
    }

    setSelectedChat(conversation);
  };

  // Subscribe to selected chat room
  useEffect(() => {
    if (selectedChat && connected) {
      // Subscribe to messages
      subscribeToChatRoom(selectedChat.chatRoomId, (message) => {
        console.log('Received message:', message);
        // Message will be handled by ChatWindow component
      });

      // Subscribe to typing indicator
      const unsubscribe = subscribeToTyping(selectedChat.chatRoomId, (indicator) => {
        setTypingIndicator(indicator);
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingIndicator(null);
        }, 3000);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [selectedChat, connected]);

  // Handle sending typing indicator
  const handleSendTyping = (isTyping) => {
    if (selectedChat) {
      sendTypingIndicator(selectedChat.chatRoomId, currentUserName, isTyping);
    }
  };

  // Handle new message callback for ChatWindow
  const handleNewMessage = (callback) => {
    if (selectedChat && connected) {
      subscribeToChatRoom(selectedChat.chatRoomId, callback);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat List Sidebar */}
      <div className="w-1/3 min-w-[320px] max-w-[400px]">
        <ChatList
          userId={currentUserId}
          onSelectChat={handleSelectChat}
          selectedChatRoomId={selectedChat?.chatRoomId}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        <ChatWindow
          chatRoomId={selectedChat?.chatRoomId}
          currentUserId={currentUserId}
          otherUser={selectedChat ? {
            id: selectedChat.otherUserId,
            name: selectedChat.otherUserName,
            photoUrl: selectedChat.otherUserPhotoUrl
          } : null}
          onNewMessage={handleNewMessage}
          onSendTyping={handleSendTyping}
          typingIndicator={typingIndicator}
        />
      </div>

      {/* Connection Status Indicator */}
      {!connected && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-700"></div>
          <span>Connecting to chat server...</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
