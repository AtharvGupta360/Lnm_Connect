import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Users, MessageSquare, TrendingUp, 
  Plus, Lock, Settings, UserPlus, UserMinus, X,
  Edit, Trash2, Pin, LockKeyhole, AlertCircle,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { spaceService } from '../services/spaceService';
import { threadService } from '../services/threadService';
import UserLink from '../components/UserLink';

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
      console.log('Loaded space data:', data);
      console.log('Space memberIds:', data.memberIds);
      console.log('Space memberCount:', data.memberCount);
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
  const [userVote, setUserVote] = useState(0); // 0 = no vote, 1 = upvote, -1 = downvote
  const [voteScore, setVoteScore] = useState(thread.voteScore || 0);
  const [isVoting, setIsVoting] = useState(false);
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
  
  const handleVote = async (value) => {
    if (isVoting) return;
    
    try {
      setIsVoting(true);
      
      // If clicking the same vote, toggle it off
      const newValue = userVote === value ? 0 : value;
      
      // Optimistic update
      const scoreDiff = newValue - userVote;
      setVoteScore(voteScore + scoreDiff);
      setUserVote(newValue);
      
      if (newValue === 0) {
        // Remove vote (toggle off)
        await threadService.voteThread(currentUserId, thread.id, value);
      } else {
        // Add or change vote
        await threadService.voteThread(currentUserId, thread.id, newValue);
      }
    } catch (error) {
      console.error('Error voting on thread:', error);
      // Revert optimistic update on error
      setVoteScore(thread.voteScore || 0);
      setUserVote(0);
      alert('Failed to vote: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsVoting(false);
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
          <UserLink 
            userId={thread.authorId} 
            userName={thread.authorName}
            className="font-medium hover:text-indigo-600 transition-colors"
          >
            {thread.authorName || 'Anonymous'}
          </UserLink>
          <span>•</span>
          <span>{thread.commentCount} comments</span>
          <span>•</span>
          <span>{thread.viewCount} views</span>
        </div>
        
        {/* Vote buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote(1);
            }}
            disabled={isVoting}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              userVote === 1
                ? 'bg-green-100 text-green-700'
                : 'hover:bg-gray-100 text-gray-600'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          
          <span className={`font-semibold min-w-[2rem] text-center ${
            voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {voteScore}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleVote(-1);
            }}
            disabled={isVoting}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              userVote === -1
                ? 'bg-red-100 text-red-700'
                : 'hover:bg-gray-100 text-gray-600'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
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
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'settings', 'moderators', 'members'
  const [editFormData, setEditFormData] = useState({
    description: space.description || '',
    rules: space.rules?.join('\n') || '',
    tags: space.tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  const [newModeratorId, setNewModeratorId] = useState('');
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;
  const isCreator = space.creatorId === currentUserId;
  
  // Load members when members tab is opened
  useEffect(() => {
    if (activeTab === 'members' && space.memberIds) {
      loadMembers();
    }
  }, [activeTab, space.memberIds]);
  
  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      console.log('Loading members for space:', space);
      console.log('Space memberIds:', space.memberIds);
      
      if (!space.memberIds || space.memberIds.length === 0) {
        console.log('No members in this space');
        setMembers([]);
        setLoadingMembers(false);
        return;
      }
      
      // Fetch members directly from the space members endpoint
      const response = await fetch(`http://localhost:8080/api/spaces/${space.id}/members`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const spaceMembers = await response.json();
      console.log('Space members from API:', spaceMembers.length, spaceMembers);
      setMembers(spaceMembers);
      
      if (spaceMembers.length === 0) {
        console.warn('No members returned from API for space:', space.id);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      alert('Failed to load members. Check console for details.');
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };
  
  const handleDeleteSpace = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete this space? This will permanently delete all threads, comments, and data. This action CANNOT be undone!')) return;
    if (!window.confirm('This is your final warning. All content will be lost forever. Are you absolutely sure?')) return;
    
    setLoading(true);
    try {
      await spaceService.deleteSpace(space.id, currentUserId);
      alert('Space deleted successfully! 🗑️');
      window.location.href = '/spaces'; // Navigate to spaces list
    } catch (error) {
      console.error('Error deleting space:', error);
      alert('Failed to delete space: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddModerator = async () => {
    if (!newModeratorId.trim()) {
      alert('Please enter a user ID');
      return;
    }
    
    setLoading(true);
    try {
      await spaceService.addModerator(space.id, currentUserId, newModeratorId.trim());
      alert('Moderator added successfully! ✅');
      setNewModeratorId('');
      onSuccess();
    } catch (error) {
      console.error('Error adding moderator:', error);
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      if (errorMsg.includes('member')) {
        alert('❌ Failed to add moderator:\n\nThe user must be a MEMBER of this space first!\n\nSteps:\n1. User must join this space\n2. Then you can promote them to moderator\n\nError: ' + errorMsg);
      } else {
        alert('Failed to add moderator:\n' + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveModerator = async (moderatorId) => {
    if (!window.confirm('Remove this user as a moderator?')) return;
    
    setLoading(true);
    try {
      await spaceService.removeModerator(space.id, currentUserId, moderatorId);
      alert('Moderator removed successfully! 🗑️');
      onSuccess();
    } catch (error) {
      console.error('Error removing moderator:', error);
      alert('Failed to remove moderator: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
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
            {['info', 'settings', 'moderators', 'members'].map((tab) => (
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
              
              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">How to add moderators:</p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>User must <strong>join this space first</strong> (be a member)</li>
                      <li>Copy their user ID from their profile or member list</li>
                      <li>Paste the ID below and click "Add"</li>
                    </ol>
                    <p className="mt-2 text-xs">💡 Tip: Users can find their ID in their profile settings</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Moderators can pin/lock threads and manage discussions. Only the creator can add or remove moderators.
                </p>
                
                {/* Space Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg border border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-indigo-600">{space.memberCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Moderators</p>
                    <p className="text-2xl font-bold text-green-600">{space.moderatorIds?.length || 0}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-gray-700">Current Moderators ({space.moderatorIds?.length || 0})</h4>
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                    {space.moderatorIds && space.moderatorIds.length > 0 ? (
                      space.moderatorIds.map((modId, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3">
                          <div>
                            <span className="font-medium text-gray-900">Moderator</span>
                            <p className="text-xs text-gray-500 font-mono">{modId.substring(0, 24)}...</p>
                          </div>
                          {isCreator && modId !== space.creatorId && (
                            <button
                              onClick={() => handleRemoveModerator(modId)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-800 text-sm font-semibold flex items-center gap-1 disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                          )}
                          {modId === space.creatorId && (
                            <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded">Creator</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No moderators yet</div>
                    )}
                  </div>
                </div>
                
                {(isCreator || space.moderatorIds?.includes(currentUserId)) && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">Add New Moderator</h4>
                    <p className="text-xs text-gray-600 mb-2">
                      ⚠️ <strong>Important:</strong> Enter the user ID of someone who has <strong>already joined</strong> this space
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newModeratorId}
                        onChange={(e) => setNewModeratorId(e.target.value)}
                        placeholder="Paste user ID here... (must be a member)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                      <button
                        onClick={handleAddModerator}
                        disabled={loading || !newModeratorId.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      💡 The user must join the space first. They can join from the space main page.
                    </p>
                  </div>
                )}
              </div>

              {!isCreator && !space.moderatorIds?.includes(currentUserId) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Restricted Access</h4>
                      <p className="text-sm text-yellow-700">
                        Only the space creator and moderators can manage moderators.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Space Members</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Member Information</p>
                    <p>View all members of this space along with their user IDs. You can copy user IDs to add them as moderators.</p>
                  </div>
                </div>
              </div>

              {/* Members Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Members</p>
                  <p className="text-3xl font-bold text-indigo-600">{space.memberCount || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Moderators</p>
                  <p className="text-3xl font-bold text-green-600">{space.moderatorIds?.length || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Threads</p>
                  <p className="text-3xl font-bold text-purple-600">{space.threadCount || 0}</p>
                </div>
              </div>

              {/* Members List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-700">All Members ({members.length})</h4>
                  <button
                    onClick={loadMembers}
                    disabled={loadingMembers}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    {loadingMembers ? '🔄 Loading...' : '🔄 Refresh'}
                  </button>
                </div>
                
                {loadingMembers ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    Loading members...
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No members found
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {members.map((member, idx) => {
                      const memberId = member.id || member._id;
                      const isModerator = space.moderatorIds?.includes(memberId);
                      const isSpaceCreator = space.creatorId === memberId;
                      const isCurrentUser = memberId === currentUserId;
                      
                      return (
                        <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {(member.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-900 truncate">{member.name || 'Member'}</p>
                                    {isSpaceCreator && (
                                      <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded font-semibold">CREATOR</span>
                                    )}
                                    {isModerator && !isSpaceCreator && (
                                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded font-semibold">MOD</span>
                                    )}
                                    {isCurrentUser && (
                                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded font-semibold">YOU</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 truncate">{member.email || 'N/A'}</p>
                                </div>
                              </div>
                              
                              {/* User ID - Click to Copy */}
                              <div className="ml-12 mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 font-semibold">User ID:</span>
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 break-all">
                                    {memberId}
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(memberId);
                                      alert('User ID copied to clipboard! 📋\n\n' + memberId);
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
                                    title="Copy user ID"
                                  >
                                    📋 Copy
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">💡 Tip: Adding Moderators</p>
                    <p>Click the "📋 Copy" button next to any member's user ID, then go to the "Moderators" tab and paste it to promote them!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex gap-3">
            {isCreator && (
              <button
                onClick={handleDeleteSpace}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Space
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SpaceDetailPage;
