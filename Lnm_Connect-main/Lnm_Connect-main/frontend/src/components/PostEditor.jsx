import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bold, Italic, Link as LinkIcon, List, Code, Image as ImageIcon, Send } from 'lucide-react';

/**
 * PostEditor Component
 * Rich-text editor for creating posts and comments
 */
const PostEditor = ({ 
  onSubmit, 
  placeholder = 'Write your post...', 
  submitText = 'Post',
  initialValue = '',
  minHeight = '120px',
  showFormatting = true
}) => {
  const [content, setContent] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  const insertFormatting = (before, after = '') => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newText = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatButtons = [
    { icon: Bold, action: () => insertFormatting('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertFormatting('*', '*'), title: 'Italic' },
    { icon: LinkIcon, action: () => insertFormatting('[', '](url)'), title: 'Link' },
    { icon: List, action: () => insertFormatting('\n- '), title: 'List' },
    { icon: Code, action: () => insertFormatting('`', '`'), title: 'Code' },
    { icon: ImageIcon, action: () => insertFormatting('![alt](', ')'), title: 'Image' },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`border-2 rounded-lg transition-colors ${
          isFocused ? 'border-indigo-500' : 'border-gray-300'
        }`}
      >
        {/* Formatting Toolbar */}
        {showFormatting && (
          <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
            {formatButtons.map((btn, index) => {
              const Icon = btn.icon;
              return (
                <motion.button
                  key={index}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={btn.action}
                  className="p-2 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                  title={btn.title}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full p-4 resize-none focus:outline-none rounded-b-lg"
          style={{ minHeight }}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-3">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!content.trim()}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {submitText}
        </motion.button>
      </div>

      {/* Helper Text */}
      {showFormatting && (
        <p className="text-xs text-gray-500 mt-2">
          Supports Markdown formatting. Select text and use toolbar buttons to format.
        </p>
      )}
    </form>
  );
};

export default PostEditor;
