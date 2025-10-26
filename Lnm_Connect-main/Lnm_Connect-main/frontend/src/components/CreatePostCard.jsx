import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Image as ImageIcon, 
  Hash, 
  Users, 
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { api, getCurrentUser } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const POST_TAGS = [
  "Hackathon", "Internship", "Placement", "Gig/Freelance Work", "Workshop",
  "Seminar", "Coding Contest", "Campus Event", "Scholarship", "Research Opportunity",
  "Project Collaboration", "Open Source", "Startup", "Club Announcement",
  "Competition", "Volunteering", "Technical Blog", "Achievement", "Miscellaneous"
];

const CreatePostCard = ({ username, onPostCreated }) => {
  const [showModal, setShowModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [postTags, setPostTags] = useState([]);
  const [postImage, setPostImage] = useState('');
  const [postApplyEnabled, setPostApplyEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!postTitle.trim() || postTags.length === 0 || !postBody.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = getCurrentUser();
      await api.createPost({
        title: postTitle,
        tags: postTags,
        body: postBody,
        image: postImage,
        authorId: user?.id,
        authorName: user?.name,
        taggedUserIds: [],
        taggedClubIds: [],
        isApplyEnabled: postApplyEnabled
      });

      setSuccess('Post created successfully! 🎉');
      toast.success('Post created successfully!');
      
      // Reset form
      setTimeout(() => {
        setPostTitle('');
        setPostBody('');
        setPostTags([]);
        setPostImage('');
        setPostApplyEnabled(false);
        setShowModal(false);
        setSuccess('');
        if (onPostCreated) onPostCreated();
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create post. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag) => {
    setPostTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <>
      {/* Create Post Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Share something with your network...
          </button>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <span>Photo</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            <Hash className="w-5 h-5 text-green-500" />
            <span>Tag</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium text-gray-600 hover:text-indigo-600"
          >
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span>Opportunity</span>
          </button>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Create a Post</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{username}</p>
                    <p className="text-xs text-gray-500">Posting to LNMConnect</p>
                  </div>
                </div>

                {/* Status Messages */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-700">{success}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Title */}
                <div className="mb-4">
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Add a title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg font-medium"
                    required
                  />
                </div>

                {/* Body */}
                <div className="mb-4">
                  <textarea
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    placeholder="What do you want to share? (Share opportunities, achievements, or start discussions...)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    rows="6"
                    required
                  />
                </div>

                {/* Image URL */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ImageIcon className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Add Image (Optional)</label>
                  </div>
                  <input
                    type="url"
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">
                      Select Tags <span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                    {POST_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          postTags.includes(tag)
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  {postTags.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {postTags.length} tag{postTags.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Apply Feature */}
                <div className="mb-4">
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={postApplyEnabled}
                      onChange={(e) => setPostApplyEnabled(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Enable Applications</span>
                      <p className="text-xs text-gray-500">Allow others to apply for this opportunity</p>
                    </div>
                  </label>
                </div>
              </form>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !postTitle.trim() || postTags.length === 0 || !postBody.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Post</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreatePostCard;
