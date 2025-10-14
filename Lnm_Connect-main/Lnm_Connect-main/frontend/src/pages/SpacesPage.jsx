import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, MessageSquare, TrendingUp, Lock, Check } from 'lucide-react';
import { spaceService } from '../services/spaceService';
import { useNavigate } from 'react-router-dom';

/**
 * Spaces Page - Display all discussion forums
 */
const SpacesPage = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'joined', 'popular'
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  // Debug logging
  console.log('Current User:', currentUser);
  console.log('Current User ID:', currentUserId);

  useEffect(() => {
    loadSpaces();
  }, [filter]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      
      // If no user is logged in, just show empty list
      if (!currentUserId) {
        setSpaces([]);
        return;
      }
      
      let data;
      if (filter === 'joined') {
        data = await spaceService.getUserSpaces(currentUserId);
      } else {
        data = await spaceService.getAllSpaces(currentUserId);
        if (filter === 'popular') {
          data = data.sort((a, b) => b.memberCount - a.memberCount);
        }
      }
      setSpaces(data);
    } catch (error) {
      console.error('Error loading spaces:', error);
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSpace = async (spaceId, e) => {
    e.stopPropagation();
    try {
      await spaceService.joinSpace(spaceId, currentUserId);
      loadSpaces(); // Refresh
    } catch (error) {
      console.error('Error joining space:', error);
      alert('Failed to join space');
    }
  };

  const handleLeaveSpace = async (spaceId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to leave this space?')) return;
    
    try {
      await spaceService.leaveSpace(spaceId, currentUserId);
      loadSpaces(); // Refresh
    } catch (error) {
      console.error('Error leaving space:', error);
      alert('Failed to leave space');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Discussion Spaces</h1>
            <p className="text-gray-600">Join communities and start discussions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!currentUserId) {
                alert('Please log in to create a space');
                return;
              }
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Space
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          {['all', 'joined', 'popular'].map((filterOption) => (
            <motion.button
              key={filterOption}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === filterOption
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Spaces Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No spaces found</h3>
            <p className="text-gray-500 mb-4">Be the first to create a discussion space!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Space
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {spaces.map((space, index) => (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/spaces/${space.id}`)}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer"
                >
                  {/* Space Icon/Banner */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                      {space.name.charAt(0)}
                    </div>
                    {space.isPrivate && <Lock className="w-5 h-5 text-gray-400" />}
                  </div>

                  {/* Space Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{space.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {space.description || 'No description available'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {space.memberCount} members
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {space.threadCount} posts
                    </div>
                  </div>

                  {/* Tags */}
                  {space.tags && space.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {space.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Join/Leave Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => space.isMember ? handleLeaveSpace(space.id, e) : handleJoinSpace(space.id, e)}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      space.isMember
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {space.isMember ? (
                      <>
                        <Check className="w-4 h-4" />
                        Joined
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Join Space
                      </>
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Space Modal - Placeholder */}
      {showCreateModal && (
        <CreateSpaceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadSpaces}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

/**
 * Create Space Modal Component
 */
const CreateSpaceModal = ({ onClose, onSuccess, currentUserId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    rules: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const rules = formData.rules.split('\n').filter(r => r.trim());

      await spaceService.createSpace(
        currentUserId,
        formData.name,
        formData.description,
        rules,
        tags
      );

      alert('Space created successfully! 🎉');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating space:', error);
      alert('Failed to create space: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Space</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Space Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., AI Research, Code Help"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Describe what this space is about..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., ai, machine-learning, python"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Rules (one per line)
              </label>
              <textarea
                rows={4}
                value={formData.rules}
                onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="1. Be respectful&#10;2. No spam&#10;3. Stay on topic"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Space'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SpacesPage;
