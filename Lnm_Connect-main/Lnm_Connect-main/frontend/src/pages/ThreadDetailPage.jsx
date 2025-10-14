import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, 
  Eye, Clock, User, Edit, Trash2, Pin, Lock, X,
  Send, MoreVertical, Flag
} from 'lucide-react';
import { threadService } from '../services/threadService';
import { spaceService } from '../services/spaceService';

/**
 * Thread Detail Page - View a specific discussion thread
 */
const ThreadDetailPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  useEffect(() => {
    loadThread();
  }, [threadId]);

  const loadThread = async () => {
    try {
      setLoading(true);
      const threadData = await threadService.getThreadById(threadId, currentUserId);
      setThread(threadData);
      
      // Load space info
      const spaceData = await spaceService.getSpaceById(threadData.spaceId, currentUserId);
      setSpace(spaceData);
    } catch (error) {
      console.error('Error loading thread:', error);
      alert('Failed to load thread: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) return;
    
    try {
      await threadService.deleteThread(threadId, currentUserId);
      alert('Thread deleted successfully');
      navigate(`/spaces/${thread.spaceId}`);
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePin = async () => {
    try {
      await threadService.togglePin(threadId, currentUserId);
      alert(thread.isPinned ? 'Thread unpinned' : 'Thread pinned');
      loadThread();
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to update pin status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLock = async () => {
    try {
      await threadService.toggleLock(threadId, currentUserId);
      alert(thread.isLocked ? 'Thread unlocked' : 'Thread locked');
      loadThread();
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert('Failed to update lock status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      // TODO: Implement comment API
      alert('Comments feature will be implemented soon!\n\nYour comment: ' + newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const canManage = thread?.isAuthor || space?.isModerator;
  const canModerate = space?.isModerator;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thread not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/spaces/${thread.spaceId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to {space?.name || 'Space'}
        </motion.button>

        {/* Thread Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Thread Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {thread.isPinned && (
                    <Pin className="w-5 h-5 text-indigo-600" fill="currentColor" />
                  )}
                  {thread.isLocked && (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <h1 className="text-3xl font-bold text-gray-900">{thread.title}</h1>
                </div>

                {/* Tags */}
                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {thread.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-gray-700">{thread.authorName || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(thread.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{thread.viewCount} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{thread.commentCount} comments</span>
                  </div>
                </div>
              </div>

              {/* Actions Dropdown */}
              {canManage && (
                <div className="relative group">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    {thread.isAuthor && (
                      <button
                        onClick={() => setShowEditModal(true)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Thread
                      </button>
                    )}
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
                          <Lock className="w-4 h-4" />
                          {thread.isLocked ? 'Unlock' : 'Lock'} Thread
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => alert('Report feature coming soon')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-yellow-600"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                    {canManage && (
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 border-t"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Thread
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Thread Content */}
          <div className="p-6 border-b border-gray-200">
            <div className="prose max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {thread.content}
              </p>
            </div>
          </div>

          {/* Voting Section */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={() => alert('Voting feature will be implemented with Vote API')}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
              >
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold">{thread.upvotes}</span>
              </button>
              <button
                onClick={() => alert('Voting feature will be implemented with Vote API')}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-300"
              >
                <ThumbsDown className="w-5 h-5 text-red-600" />
                <span className="font-semibold">{thread.downvotes}</span>
              </button>
              <div className="ml-4 text-lg font-bold">
                Score: <span className={thread.voteScore > 0 ? 'text-green-600' : thread.voteScore < 0 ? 'text-red-600' : 'text-gray-600'}>
                  {thread.voteScore > 0 ? '+' : ''}{thread.voteScore}
                </span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Comments ({thread.commentCount})
            </h2>

            {/* Add Comment Form */}
            {!thread.isLocked ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {submittingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Lock className="w-5 h-5" />
                  <span className="font-semibold">This thread is locked. New comments are not allowed.</span>
                </div>
              </div>
            )}

            {/* Comments List - Placeholder */}
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No comments yet</h3>
              <p className="text-gray-500">
                Be the first to share your thoughts!
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Note: Full comment system with nested replies will be implemented soon.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Thread Modal */}
      {showEditModal && (
        <EditThreadModal
          thread={thread}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadThread();
          }}
        />
      )}
    </div>
  );
};

/**
 * Edit Thread Modal Component
 */
const EditThreadModal = ({ thread, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: thread.title,
    content: thread.content,
    tags: thread.tags?.join(', ') || ''
  });
  const [loading, setLoading] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      
      await threadService.updateThread(
        thread.id,
        currentUserId,
        formData.title,
        formData.content,
        tags
      );
      
      alert('Thread updated successfully! ✅');
      onSuccess();
    } catch (error) {
      console.error('Error updating thread:', error);
      alert('Failed to update thread: ' + (error.response?.data?.message || error.message));
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
          <h2 className="text-2xl font-bold text-gray-900">Edit Thread</h2>
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
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ThreadDetailPage;
