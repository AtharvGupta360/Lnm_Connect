import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

/**
 * VoteButton Component
 * Reusable upvote/downvote button for threads and comments
 */
const VoteButton = ({ 
  upvotes = 0, 
  downvotes = 0, 
  userVote = null, // null, 1 (upvoted), or -1 (downvoted)
  onVote,
  size = 'md',
  disabled = false 
}) => {
  const score = upvotes - downvotes;
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleUpvote = () => {
    if (!disabled && onVote) {
      onVote(userVote === 1 ? 0 : 1); // Toggle upvote
    }
  };

  const handleDownvote = () => {
    if (!disabled && onVote) {
      onVote(userVote === -1 ? 0 : -1); // Toggle downvote
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Upvote Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        onClick={handleUpvote}
        disabled={disabled}
        className={`p-1 rounded-lg transition-colors ${
          userVote === 1
            ? 'text-orange-600 bg-orange-100'
            : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        title="Upvote"
      >
        <ArrowUp className={iconSizes[size]} strokeWidth={2.5} />
      </motion.button>

      {/* Score */}
      <span
        className={`font-bold ${sizeClasses[size]} ${
          score > 0 ? 'text-orange-600' : score < 0 ? 'text-blue-600' : 'text-gray-600'
        }`}
      >
        {score > 0 ? '+' : ''}{score}
      </span>

      {/* Downvote Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        onClick={handleDownvote}
        disabled={disabled}
        className={`p-1 rounded-lg transition-colors ${
          userVote === -1
            ? 'text-blue-600 bg-blue-100'
            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
        } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        title="Downvote"
      >
        <ArrowDown className={iconSizes[size]} strokeWidth={2.5} />
      </motion.button>
    </div>
  );
};

export default VoteButton;
