import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MoreVertical, Phone, Video, MessageCircle } from 'lucide-react';
import { chatService } from '../services/chatService';

const ChatWindow = ({ 
  chatRoomId, 
  currentUserId, 
  otherUser,
  onNewMessage,
  onSendTyping,
  typingIndicator
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatRoomId) {
      loadMessages();
      markAsRead();
    }
  }, [chatRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for new messages from parent
  useEffect(() => {
    if (onNewMessage && chatRoomId) {
      const handleMessage = (message) => {
        if (message.chatRoomId === chatRoomId) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === message.id)) {
              return prev.map(m => m.id === message.id ? message : m);
            }
            return [...prev, message];
          });
          
          // Mark as read if message is from other user
          if (message.senderId !== currentUserId) {
            markAsRead();
          }
        }
      };
      
      return onNewMessage(handleMessage);
    }
  }, [chatRoomId, onNewMessage, currentUserId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await chatService.getChatRoomMessages(chatRoomId, currentUserId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await chatService.markAsRead(chatRoomId, currentUserId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX
    
    try {
      setSending(true);
      const message = await chatService.sendMessage(
        currentUserId,
        otherUser.id,
        messageContent
      );
      
      // Don't add message here - let WebSocket handle it to avoid duplicates
      // The message will be added via the onNewMessage callback
      
      // Stop typing indicator
      if (onSendTyping) {
        onSendTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
      // Restore message on error
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!onSendTyping) return;

    // Send typing indicator
    onSendTyping(true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onSendTyping(false);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessageStatus = (message) => {
    if (message.senderId !== currentUserId) return null;
    
    switch (message.status) {
      case 'SENT':
        return <span className="text-gray-400 text-xs">✓</span>;
      case 'DELIVERED':
        return <span className="text-gray-400 text-xs">✓✓</span>;
      case 'READ':
        return <span className="text-blue-500 text-xs">✓✓</span>;
      default:
        return null;
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = formatDate(msg.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (!chatRoomId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-500">
          <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-xl">Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          {otherUser.photoUrl ? (
            <img
              src={otherUser.photoUrl}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold mr-3">
              {otherUser.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.name}</h3>
            {typingIndicator && typingIndicator.isTyping && typingIndicator.userId !== currentUserId && (
              <p className="text-sm text-green-500">typing...</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {date}
                  </span>
                </div>

                {/* Messages */}
                {msgs.map((message, index) => {
                  const isOwnMessage = message.senderId === currentUserId;
                  const showAvatar = index === 0 || msgs[index - 1].senderId !== message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isOwnMessage && (
                        <div className="flex-shrink-0 mr-2">
                          {showAvatar ? (
                            otherUser.photoUrl ? (
                              <img
                                src={otherUser.photoUrl}
                                alt={otherUser.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                                {otherUser.name.charAt(0).toUpperCase()}
                              </div>
                            )
                          ) : (
                            <div className="w-8 h-8"></div>
                          )}
                        </div>
                      )}

                      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                          }`}
                        >
                          <p className="break-words">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <span>{formatTime(message.timestamp)}</span>
                          {getMessageStatus(message)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
