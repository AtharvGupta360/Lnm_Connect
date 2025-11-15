import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, CheckCircle, MessageSquare, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * TagsFeedPage - Display all tags/mentions for the current user
 */
const TagsFeedPage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const navigate = useNavigate();
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  useEffect(() => {
    loadTags();
  }, [filter]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'unread' 
        ? `http://localhost:8080/api/tags/user/${currentUserId}/unread`
        : `http://localhost:8080/api/tags/user/${currentUserId}`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (tagIds) => {
    try {
      await fetch('http://localhost:8080/api/tags/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagIds })
      });
      loadTags();
    } catch (error) {
      console.error('Error marking tags as read:', error);
    }
  };

  const handleTagClick = (tag) => {
    // Mark as read
    if (!tag.isRead) {
      markAsRead([tag.id]);
    }

    // Navigate to the content
    if (tag.contentType === 'post') {
      navigate('/'); // Navigate to home to see the post
    } else if (tag.contentType === 'thread') {
      navigate(`/threads/${tag.contentId}`);
    }
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case 'post':
        return <FileText className="w-4 h-4" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'thread':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your tags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Tags</h1>
                <p className="text-gray-600">See where people mentioned you</p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Tags
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Tags List */}
        {tags.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tags yet</h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? "You're all caught up! No unread mentions."
                : "When someone tags you, it will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleTagClick(tag)}
                className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all ${
                  !tag.isRead ? 'border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Tagger Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getContentIcon(tag.contentType)}
                        <span className="text-sm font-semibold text-gray-700 capitalize">
                          {tag.contentType}
                        </span>
                        {!tag.isRead && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-gray-900 mb-3 line-clamp-3">
                      {tag.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      {!tag.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead([tag.id]);
                          }}
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTagClick(tag);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900 font-semibold"
                      >
                        View {tag.contentType} →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mark All as Read */}
        {tags.length > 0 && tags.some(tag => !tag.isRead) && (
          <div className="mt-6 text-center">
            <button
              onClick={() => markAsRead(tags.filter(t => !t.isRead).map(t => t.id))}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Mark All as Read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsFeedPage;
