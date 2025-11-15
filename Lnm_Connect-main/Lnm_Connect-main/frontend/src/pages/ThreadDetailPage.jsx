import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MessageSquare, ArrowUp, ArrowDown, 
  Send, Edit, Trash2, Reply, User, Pin, LockKeyhole, X
} from 'lucide-react';
import { threadService } from '../services/threadService';

/**
 * Thread Detail Page - View a single thread with comments
 */
const ThreadDetailPage = () => {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id || currentUser._id;

  useEffect(() => {
    loadThreadData();
  }, [threadId]);

  const loadThreadData = async () => {
    try {
      setLoading(true);
      const threadData = await threadService.getThreadById(threadId, currentUserId);
      setThread(threadData);
      
      // Load comments
      try {
        const commentsData = await threadService.getComments(threadId, currentUserId);
        setComments(commentsData);
      } catch (err) {
        console.log('Comments feature not yet available');
        setComments([]);
      }
    } catch (error) {
      console.error('Error loading thread:', error);
      alert('Failed to load thread');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await threadService.addComment(currentUserId, threadId, newComment.trim(), replyingTo);
      setNewComment('');
      setReplyingTo(null);
      loadThreadData();
      alert('Comment added! 💬');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteThread = async () => {
    if (!window.confirm('Are you sure you want to delete this thread? This action cannot be undone.')) return;
    
    try {
      await threadService.deleteThread(threadId, currentUserId);
      alert('Thread deleted successfully! 🗑️');
      navigate(-1);
    } catch (error) {
      console.error('Error deleting thread:', error);
      alert('Failed to delete thread: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleVote = async (value) => {
    try {
      await threadService.voteThread(currentUserId, threadId, value);
      loadThreadData();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote: ' + (error.response?.data?.message || error.message));
    }
  };

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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Thread Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-start gap-2 mb-4">
            {thread.isPinned && (
              <Pin className="w-5 h-5 text-indigo-600" fill="currentColor" />
            )}
            {thread.isLocked && (
              <LockKeyhole className="w-5 h-5 text-gray-500" />
            )}
            <h1 className="text-3xl font-bold text-gray-900 flex-1">{thread.title}</h1>
            {/* Delete button for thread author */}
            {thread.authorId === currentUserId && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeleteThread}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete thread"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{thread.authorName || 'Anonymous'}</span>
            </div>
            <span>•</span>
            <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {thread.content}
            </p>
          </div>

          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
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

          <div className="flex items-center gap-6 pt-4 border-t">
            {/* Vote buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote(1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <ArrowUp className="w-5 h-5 text-gray-600" />
              </button>
              
              <span className={`font-bold text-lg ${
                thread.voteScore > 0 ? 'text-green-600' : thread.voteScore < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {thread.voteScore || 0}
              </span>
              
              <button
                onClick={() => handleVote(-1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
              >
                <ArrowDown className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold">{thread.commentCount || 0} comments</span>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          {!thread.isLocked && (
            <form onSubmit={handleAddComment} className="mb-8">
              {replyingTo && (
                <div className="mb-2 flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded">
                  <Reply className="w-4 h-4" />
                  <span>Replying to comment...</span>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(null)}
                    className="ml-auto text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Write your reply..." : "Share your thoughts..."}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {replyingTo ? 'Post Reply' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}

          {thread.isLocked && (
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
              <LockKeyhole className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-semibold">
                This thread is locked. No new comments can be added.
              </span>
            </div>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No comments yet</h3>
              <p className="text-gray-500">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{comment.authorName || 'Anonymous'}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {!thread.isLocked && (
                          <button
                            onClick={() => {
                              setReplyingTo(comment.id);
                              setNewComment('');
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1"
                            title="Reply to comment"
                          >
                            <Reply className="w-4 h-4" />
                            Reply
                          </button>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ThreadDetailPage;
