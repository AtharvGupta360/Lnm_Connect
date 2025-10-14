import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageCircle, MoreVertical, Flag, Edit2, Trash2 } from 'lucide-react';
import VoteButton from './VoteButton';
import PostEditor from './PostEditor';

/**
 * CommentThread Component
 * Displays a comment with nested replies (recursive)
 */
const CommentThread = ({ 
  comment, 
  onVote, 
  onReply, 
  onEdit, 
  onDelete, 
  onReport,
  currentUserId,
  depth = 0,
  maxDepth = 3
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showReplyEditor, setShowReplyEditor] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isAuthor = comment.authorId === currentUserId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canNest = depth < maxDepth;

  const handleReply = (content) => {
    if (onReply) {
      onReply(comment.id, content);
      setShowReplyEditor(false);
    }
  };

  const handleEdit = (content) => {
    if (onEdit) {
      onEdit(comment.id, content);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this comment?')) {
      onDelete && onDelete(comment.id);
    }
  };

  const handleReport = () => {
    if (confirm('Report this comment as inappropriate?')) {
      onReport && onReport(comment.id);
    }
    setShowMenu(false);
  };

  // Calculate indent based on depth
  const indent = depth * 24; // 24px per level

  return (
    <div className="relative" style={{ marginLeft: depth > 0 ? `${indent}px` : '0' }}>
      {/* Vertical Line for nested comments */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200" />
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow ${
          isCollapsed ? 'opacity-60' : ''
        }`}
      >
        {/* Comment Header */}
        <div className="flex items-start gap-3">
          {/* Vote Section */}
          <VoteButton
            upvotes={comment.upvotes}
            downvotes={comment.downvotes}
            userVote={comment.userVote}
            onVote={(value) => onVote && onVote(comment.id, value)}
            size="sm"
          />

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-2">
              <img
                src={comment.authorPhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName)}&background=4f46e5&color=fff&size=32`}
                alt={comment.authorName}
                className="w-6 h-6 rounded-full"
              />
              <span className="font-semibold text-sm text-gray-900">{comment.authorName}</span>
              {isAuthor && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">You</span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400 italic">(edited)</span>
              )}
            </div>

            {/* Comment Text */}
            {isEditing ? (
              <PostEditor
                initialValue={comment.content}
                onSubmit={handleEdit}
                placeholder="Edit your comment..."
                submitText="Save"
                minHeight="80px"
                showFormatting={true}
              />
            ) : (
              <div className={`text-sm text-gray-700 ${isCollapsed ? 'line-clamp-2' : ''}`}>
                {comment.isDeleted ? (
                  <span className="italic text-gray-400">[Comment deleted]</span>
                ) : (
                  <p className="whitespace-pre-wrap break-words">{comment.content}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!comment.isDeleted && !isEditing && (
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => setShowReplyEditor(!showReplyEditor)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-600 font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Reply
                </button>

                {hasReplies && (
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-600 font-semibold transition-colors"
                  >
                    {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                    {isCollapsed ? 'Show' : 'Hide'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                  </button>
                )}

                {/* More Options Menu */}
                <div className="relative ml-auto">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                      >
                        {isAuthor ? (
                          <>
                            <button
                              onClick={() => {
                                setIsEditing(true);
                                setShowMenu(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={handleDelete}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleReport}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50"
                          >
                            <Flag className="w-4 h-4" />
                            Report
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Reply Editor */}
            <AnimatePresence>
              {showReplyEditor && canNest && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <PostEditor
                    onSubmit={handleReply}
                    placeholder="Write a reply..."
                    submitText="Reply"
                    minHeight="80px"
                    showFormatting={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Nested Replies */}
      <AnimatePresence>
        {hasReplies && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            {comment.replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                onVote={onVote}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
                currentUserId={currentUserId}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show "Continue thread" button if max depth reached */}
      {hasReplies && depth >= maxDepth && (
        <button className="ml-6 text-xs text-indigo-600 hover:text-indigo-700 font-semibold">
          → Continue this thread
        </button>
      )}
    </div>
  );
};

export default CommentThread;
