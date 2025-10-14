import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * TagChip Component
 * Displays a tag with optional remove functionality
 */
const TagChip = ({ 
  tag, 
  onRemove, 
  variant = 'default', // 'default', 'primary', 'success', 'warning'
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    primary: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors ${variants[variant]} ${sizes[size]}`}
    >
      {tag}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove tag"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.span>
  );
};

export default TagChip;
