import React, { useState, useEffect } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { chatService } from '../services/chatService';

const ChatList = ({ userId, onSelectChat, selectedChatRoomId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
    // Refresh conversations every 10 seconds
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const loadConversations = async () => {
    try {
      const data = await chatService.getUserConversations(userId);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status, isFromMe) => {
    if (!isFromMe) return null;
    
    switch (status) {
      case 'SENT':
        return <span className="text-gray-400">✓</span>;
      case 'DELIVERED':
        return <span className="text-gray-400">✓✓</span>;
      case 'READ':
        return <span className="text-blue-500">✓✓</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <MessageCircle className="w-16 h-16 mb-4" />
            <p className="text-center">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.chatRoomId}
              onClick={() => onSelectChat(conv)}
              className={`flex items-start p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedChatRoomId === conv.chatRoomId ? 'bg-blue-50' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 mr-3">
                {conv.otherUserPhotoUrl ? (
                  <img
                    src={conv.otherUserPhotoUrl}
                    alt={conv.otherUserName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                    {conv.otherUserName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conv.otherUserName}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {formatTime(conv.lastMessageTime)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                  
                  <div className="flex items-center gap-2 ml-2">
                    {getStatusIcon(conv.lastMessageStatus, conv.isLastMessageFromMe)}
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
