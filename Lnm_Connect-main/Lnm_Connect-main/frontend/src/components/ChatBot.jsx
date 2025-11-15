import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader, Sparkles, RefreshCw, X, Maximize2, Minimize2 } from 'lucide-react';

// Allow overriding the API URL via Vite env variable VITE_API_URL (e.g. VITE_API_URL=http://localhost:8000/api)
const API_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:8000/api';

const ChatBot = ({ currentUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [size, setSize] = useState({ width: 420, height: 600 });
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBotRef = useRef(null);

  // Initial greeting
  useEffect(() => {
    const greeting = {
      role: 'assistant',
      content: `Hi ${currentUser?.name || 'there'}! 👋 I'm your LNMConnect AI assistant. I can help you with:\n\n• 📚 Academic information (courses, exams, grading)\n• 🎉 Campus events and festivals\n• 🏠 Hostel and mess facilities\n• 📞 Important contacts\n• ⚽ Sports facilities\n• 📖 Library information\n\nWhat would you like to know?`,
      timestamp: new Date().toISOString()
    };
    setMessages([greeting]);
  }, [currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentInput,
          user_id: currentUser?.id
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data = await response.json();

      // Simulate typing delay
      setTimeout(() => {
        const botMessage = {
          role: 'assistant',
          content: data.answer,
          timestamp: new Date().toISOString(),
          confidence: data.confidence,
          sources: data.sources || []
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide a helpful fallback response
      const fallbackMessage = {
        role: 'assistant',
        content: `I apologize, but I'm currently unable to connect to the AI service. This might be because:\n\n• 🔧 The chatbot server is not running\n• 🌐 Network connectivity issues\n• 🔑 API quota has been exceeded\n\nIn the meantime, here are some helpful resources:\n\n📚 **Academic Info:** Contact your department office\n🏠 **Hostel:** Contact hostel warden\n📞 **Emergency:** Call campus security\n📖 **Library:** Visit the library in person\n\nPlease try again later or contact the technical support team.`,
        timestamp: new Date().toISOString(),
        confidence: 'error'
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetConversation = () => {
    setConversationId(null);
    setMessages([{
      role: 'assistant',
      content: `Hi ${currentUser?.name || 'there'}! 👋 I'm your LNMConnect AI assistant. What would you like to know?`,
      timestamp: new Date().toISOString()
    }]);
  };

  const formatMessage = (content) => {
    // Convert markdown-style formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return <li key={i} className="ml-4">{line.replace(/^[•-]\s*/, '')}</li>;
        }
        // Bold text
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <p key={i} className="mb-2">
              {parts.map((part, j) => 
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </p>
          );
        }
        // Regular paragraph
        return line.trim() ? <p key={i} className="mb-2">{line}</p> : <br key={i} />;
      });
  };

  const handleResize = (e, direction) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const handleMouseMove = (e) => {
      const deltaX = startX - e.clientX; // Reversed because it's on the right
      const deltaY = startY - e.clientY; // Reversed because it's on the bottom

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('left')) {
        newWidth = Math.max(350, Math.min(800, startWidth + deltaX));
      }
      if (direction.includes('top')) {
        newHeight = Math.max(400, Math.min(900, startHeight + deltaY));
      }

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <motion.div
      ref={chatBotRef}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      style={isFullscreen ? {} : { 
        width: `${size.width}px`, 
        height: `${size.height}px`,
        minWidth: '350px',
        minHeight: '400px',
        maxWidth: '800px',
        maxHeight: '900px'
      }}
      className={isFullscreen 
        ? "fixed inset-0 bg-white flex flex-col z-50 rounded-none" 
        : "fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl flex flex-col z-50"
      }
    >
        {/* Header */}
        <div className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between ${
          isFullscreen ? '' : 'rounded-t-2xl'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="w-8 h-8" />
              <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">LNM Campus Assistant</h2>
              <p className="text-xs text-indigo-100">Powered by AI • Always here to help</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetConversation}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title="New conversation"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
                  }`}>
                    {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 shadow-md rounded-tl-none border border-gray-100'
                  }`}>
                    <div className="text-sm leading-relaxed">
                      {formatMessage(message.content)}
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">📚 Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, i) => {
                            // Handle both string sources and object sources {file, score}
                            const sourceText = typeof source === 'string' ? source : source.file;
                            const confidence = typeof source === 'object' ? source.score : null;
                            
                            return (
                              <span
                                key={i}
                                className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
                                title={confidence ? `Confidence: ${(confidence * 100).toFixed(0)}%` : undefined}
                              >
                                {sourceText}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'
                    }`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about LNMIIT..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={loading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                loading || !input.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>Send</span>
            </button>
          </div>

          {/* Quick Questions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInput("When is the next fest?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
            >
              📅 Next fest?
            </button>
            <button
              onClick={() => setInput("What are the hostel timings?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
            >
              🏠 Hostel timings?
            </button>
            <button
              onClick={() => setInput("How is the grading system?")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
            >
              📚 Grading system?
            </button>
            <button
              onClick={() => setInput("Library contact information")}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition"
            >
              📞 Library contact?
            </button>
          </div>
        </div>

        {/* Resize Handles - Hidden in fullscreen */}
        {!isFullscreen && (
          <>
            {/* Top-Left Corner */}
            <div
              onMouseDown={(e) => handleResize(e, 'top-left')}
              className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize hover:bg-indigo-200 transition-colors rounded-tl-2xl"
              style={{ zIndex: 60 }}
            />
            
            {/* Top Edge */}
            <div
              onMouseDown={(e) => handleResize(e, 'top')}
              className="absolute top-0 left-4 right-4 h-2 cursor-ns-resize hover:bg-indigo-200 transition-colors"
              style={{ zIndex: 60 }}
            />
            
            {/* Left Edge */}
            <div
              onMouseDown={(e) => handleResize(e, 'left')}
              className="absolute top-4 bottom-4 left-0 w-2 cursor-ew-resize hover:bg-indigo-200 transition-colors"
              style={{ zIndex: 60 }}
            />
            
            {/* Resize indicator in bottom-left corner */}
            <div className="absolute bottom-2 left-2 text-gray-400 pointer-events-none select-none text-xs">
              <svg width="16" height="16" viewBox="0 0 16 16" className="rotate-90">
                <path d="M14 14L14 10M14 14L10 14M14 14L8 8M14 6L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </>
        )}
      </motion.div>
  );
};

export default ChatBot;
