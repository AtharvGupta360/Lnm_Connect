import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, MessageSquare, TrendingUp, 
  Plus, Lock, Settings, UserPlus, UserMinus, X,
  Edit, Trash2, Pin, LockKeyhole, AlertCircle
} from 'lucide-react';
import { spaceService } from '../services/spaceService';
import { threadService } from '../services/threadService';

/**
 * Space Detail Page - View a specific discussion space
 */
const SpaceDetailPage = () => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  useEffect(() => {
    loadSpace();
  }, [spaceId]);

  const loadSpace = async () => {
    try {
      setLoading(true);
      const data = await spaceService.getSpaceById(spaceId, currentUserId);
      setSpace(data);
      
      // Load threads for this space
      if (currentUserId) {
        const threadsData = await threadService.getThreadsBySpace(spaceId, currentUserId);
        setThreads(threadsData);
      }
    } catch (error) {
      console.error('Error loading space:', error);
      alert('Failed to load space');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async () => {
    try {
      if (space.isMember) {
        if (!confirm('Are you sure you want to leave this space?')) return;
        await spaceService.leaveSpace(spaceId, currentUserId);
        alert('You have left the space');
      } else {
        await spaceService.joinSpace(spaceId, currentUserId);
        alert('Welcome to the space! 🎉');
      }
      loadSpace(); // Refresh
    } catch (error) {
      console.error('Error joining/leaving space:', error);
      alert('Failed to update membership: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleManage = () => {
    setShowManageModal(true);
  };

  const handleNewThread = () => {
    setShowNewThreadModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading space...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Space not found</h2>
          <button
            onClick={() => navigate('/spaces')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Back to Spaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/spaces')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Spaces
        </motion.button>

        {/* Space Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-gray-900">{space.name}</h1>
                {space.isPrivate && (
                  <Lock className="w-6 h-6 text-gray-500" />
                )}
              </div>
              <p className="text-gray-600 text-lg mb-4">{space.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{space.memberCount} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>{space.threadCount} threads</span>
                </div>
              </div>

              {/* Tags */}
              {space.tags && space.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {space.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {space.isModerator && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManage}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                >
                  <Settings className="w-5 h-5" />
                  Manage
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinLeave}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
                  space.isMember
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {space.isMember ? (
                  <>
                    <UserMinus className="w-5 h-5" />
                    Leave
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Join
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Rules Section */}
          {space.rules && space.rules.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Space Rules</h3>
              <ul className="space-y-2">
                {space.rules.map((rule, index) => (
                  <li key={index} className="text-gray-700 flex items-start gap-2">
                    <span className="font-semibold text-indigo-600">{index + 1}.</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Threads Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Threads</h2>
            {space.isMember && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewThread}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              >
                <Plus className="w-5 h-5" />
                New Thread
              </motion.button>
            )}
          </div>

          {/* Thread List */}
          {threads.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No threads yet</h3>
              <p className="text-gray-500">
                {space.isMember 
                  ? 'Be the first to start a discussion!'
                  : 'Join this space to start discussions'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map((thread) => (
                <ThreadCard 
                  key={thread.id} 
                  thread={thread} 
                  space={space}
                  currentUserId={currentUserId}
                  onRefresh={loadSpace}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <NewThreadModal
          spaceId={spaceId}
          onClose={() => setShowNewThreadModal(false)}
          onSuccess={() => {
            setShowNewThreadModal(false);
            loadSpace();
          }}
        />
      )}

      {/* Manage Space Modal */}
      {showManageModal && (
        <ManageSpaceModal
          space={space}
          onClose={() => setShowManageModal(false)}
          onSuccess={() => {
            setShowManageModal(false);
            loadSpace();
          }}
        />
      )}
    </div>
  );
};

/**
 * Thread Card Component
 */
const ThreadCard = ({ thread, space, currentUserId, onRefresh }) => {
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this thread?')) return;
    
    try {
      await threadService.deleteThread(thread.id, currentUserId);
      alert('Thread deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handlePin = async () => {
    try {
      await threadService.togglePin(thread.id, currentUserId);
      alert(thread.isPinned ? 'Thread unpinned' : 'Thread pinned');
      onRefresh();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update pin status: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleLock = async () => {
    try {
      await threadService.toggleLock(thread.id, currentUserId);
      alert(thread.isLocked ? 'Thread unlocked' : 'Thread locked');
      onRefresh();
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert('Failed to update lock status: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const canManage = thread.isAuthor || space?.isModerator;
  const canModerate = space?.isModerator;
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/threads/${thread.id}`)}>
          <div className="flex items-center gap-2 mb-2">
            {thread.isPinned && (
              <Pin className="w-4 h-4 text-indigo-600" fill="currentColor" />
            )}
            {thread.isLocked && (
              <LockKeyhole className="w-4 h-4 text-gray-500" />
            )}
            <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
              {thread.title}
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{thread.content}</p>
          
          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {thread.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {canManage && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {canModerate && (
                  <>
                    <button
                      onClick={handlePin}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Pin className="w-4 h-4" />
                      {thread.isPinned ? 'Unpin' : 'Pin'} Thread
                    </button>
                    <button
                      onClick={handleLock}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LockKeyhole className="w-4 h-4" />
                      {thread.isLocked ? 'Unlock' : 'Lock'} Thread
                    </button>
                  </>
                )}
                {canManage && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Thread
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="font-medium">{thread.authorName || 'Anonymous'}</span>
          <span>•</span>
          <span>{thread.commentCount} comments</span>
          <span>•</span>
          <span>{thread.viewCount} views</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span className={thread.voteScore > 0 ? 'text-green-600 font-semibold' : thread.voteScore < 0 ? 'text-red-600 font-semibold' : ''}>
            {thread.voteScore}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * New Thread Modal Component
 */
const NewThreadModal = ({ spaceId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      await threadService.createThread(
        currentUserId,
        spaceId,
        formData.title,
        formData.content,
        tags
      );
      
      alert('Thread created successfully! 🎉');
      onSuccess();
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread: ' + (error.response?.data?.message || error.message));
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Thread</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thread Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="What's your thread about?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Share your thoughts..."
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
                placeholder="e.g., help, discussion, question"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Thread'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/**
 * Manage Space Modal Component
 */
const ManageSpaceModal = ({ space, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'settings', 'moderators'
  const [editFormData, setEditFormData] = useState({
    description: space.description || '',
    rules: space.rules?.join('\n') || '',
    tags: space.tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // TODO: Implement space update API
      const rules = editFormData.rules.split('\n').filter(r => r.trim());
      const tags = editFormData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      // For now, just show success message
      alert('Space settings updated successfully! ✅\n\nNote: Full backend implementation coming soon.');
      onSuccess();
    } catch (error) {
      console.error('Error updating space:', error);
      alert('Failed to update space: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Manage Space</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2">
            {['info', 'settings', 'moderators'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Space Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Name:</span>
                  <p className="text-gray-900">{space.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Description:</span>
                  <p className="text-gray-900">{space.description}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="font-semibold text-gray-700">Members:</span>
                    <p className="text-2xl font-bold text-indigo-600">{space.memberCount}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Threads:</span>
                    <p className="text-2xl font-bold text-indigo-600">{space.threadCount}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Moderators:</span>
                    <p className="text-2xl font-bold text-indigo-600">{space.moderatorIds?.length || 0}</p>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Creator:</span>
                  <p className="text-gray-900">{space.creatorName || 'Unknown'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Created:</span>
                  <p className="text-gray-900">{new Date(space.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Space Settings</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Space description..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editFormData.tags}
                  onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., programming, help, discussion"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rules (one per line)
                </label>
                <textarea
                  value={editFormData.rules}
                  onChange={(e) => setEditFormData({ ...editFormData, rules: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter space rules, one per line..."
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}

          {/* Moderators Tab */}
          {activeTab === 'moderators' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderator Management</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Current moderators have the ability to pin/lock threads, delete posts, and manage the space.
                </p>
                
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-gray-700">Current Moderators ({space.moderatorIds?.length || 0})</h4>
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    {space.moderatorIds && space.moderatorIds.length > 0 ? (
                      <ul className="space-y-2">
                        {space.moderatorIds.map((modId, idx) => (
                          <li key={idx} className="flex items-center justify-between">
                            <span className="text-gray-700">Moderator #{idx + 1}</span>
                            <span className="text-xs text-gray-500">{modId.substring(0, 8)}...</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No moderators</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Add New Moderator</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter user ID..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => alert('Add moderator feature: Backend implementation required')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-1">Note</h4>
                    <p className="text-sm text-yellow-700">
                      Full moderator management features (add/remove moderators) will be implemented in the backend soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SpaceDetailPage;
