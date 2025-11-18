import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Eye, Calendar, User, MapPin, Tag, Loader2 } from 'lucide-react';
import UserLink from '../components/UserLink';

const API_URL = 'http://localhost:8080/api/posts';

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const getUserId = () => localStorage.getItem('userId') || '';
  const getUsername = () => localStorage.getItem('username') || 'User';

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/${postId}?userId=${getUserId()}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data = await response.json();
      setPost(data);
      setError(null);
    } catch (err) {
      console.error('Error loading post:', err);
      setError('Post not found or has been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post || isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch(`${API_URL}/${postId}/like?userId=${getUserId()}`, {
        method: 'POST'
      });
      const updatedPost = await response.json();
      setPost(updatedPost);
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;

    const comment = {
      userId: getUserId(),
      userName: getUsername(),
      text: commentInput,
      timestamp: Date.now()
    };

    try {
      const response = await fetch(`${API_URL}/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      const updatedPost = await response.json();
      setPost(updatedPost);
      setCommentInput('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isLiked = post.likes?.includes(getUserId());

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <UserLink userId={post.authorId} userName={post.authorName}>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md hover:scale-105 transition-transform cursor-pointer">
                  {post.authorName?.charAt(0).toUpperCase() || 'U'}
                </div>
              </UserLink>
              <div className="flex-1">
                <UserLink 
                  userId={post.authorId} 
                  userName={post.authorName}
                  className="text-lg font-bold text-gray-900 hover:text-indigo-600"
                >
                  {post.authorName || 'Unknown User'}
                </UserLink>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Post Title */}
          <div className="px-6 pt-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          </div>

          {/* Post Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Post Body */}
          <div className="px-6 pb-6">
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {post.body}
            </div>
          </div>

          {/* Post Image */}
          {post.image && (
            <div className="px-6 pb-6">
              <img
                src={post.image}
                alt={post.title}
                className="w-full rounded-xl shadow-md"
              />
            </div>
          )}

          {/* Post Stats & Actions */}
          <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  {post.likes?.length || 0} likes
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {post.comments?.length || 0} comments
                </span>
              </div>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isLiked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-500 hover:text-red-500'
                }`}
              >
                {isLiked ? '❤️ Liked' : '🤍 Like'}
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Comments</h3>
            
            {/* Add Comment */}
            <div className="mb-6">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows="3"
              />
              <button
                onClick={handleAddComment}
                disabled={!commentInput.trim()}
                className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post Comment
              </button>
            </div>

            {/* Comments List */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <UserLink userId={comment.userId} userName={comment.userName}>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 cursor-pointer">
                          {comment.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </UserLink>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <UserLink 
                            userId={comment.userId} 
                            userName={comment.userName}
                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                          >
                            {comment.userName}
                          </UserLink>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetailPage;
