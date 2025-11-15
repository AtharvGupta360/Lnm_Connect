import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X } from 'lucide-react';

/**
 * UserTagInput - Professional user tagging component
 * Supports @ mentions with dropdown, keyboard navigation, and tag highlighting
 */
const UserTagInput = ({
  value,
  onChange,
  placeholder = "What's on your mind? Use @ to tag someone...",
  className = "",
  minRows = 3,
  maxRows = 10,
  disabled = false,
  onTagsChange = () => {}
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [tags, setTags] = useState([]);
  
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Debounced search for users
  useEffect(() => {
    if (searchQuery.length > 0) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);
    } else {
      setUsers([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Search users from API
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/auth/users`);
      if (response.ok) {
        const allUsers = await response.json();
        
        // Filter users by name or email containing query
        const filtered = allUsers
          .filter(user => 
            user.name?.toLowerCase().includes(query.toLowerCase()) ||
            user.email?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10); // Limit to 10 results
        
        setUsers(filtered);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle text change
  const handleTextChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check if @ was typed
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if we're still in a mention (no space after @)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setSearchQuery(textAfterAt);
        setShowDropdown(true);
        setSelectedIndex(0);
        return;
      }
    }
    
    setShowDropdown(false);
    setSearchQuery('');
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      // Replace @query with @username
      const beforeAt = textBeforeCursor.substring(0, lastAtIndex);
      const mention = `@${user.name}`;
      const newValue = beforeAt + mention + ' ' + textAfterCursor;
      
      onChange(newValue);
      
      // Update tags list
      const newTag = {
        userId: user.id || user._id,
        username: user.name,
        position: lastAtIndex
      };
      
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      onTagsChange(updatedTags);

      // Close dropdown
      setShowDropdown(false);
      setSearchQuery('');
      
      // Set cursor position after the mention
      setTimeout(() => {
        const newCursorPos = beforeAt.length + mention.length + 1;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!showDropdown || users.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % users.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
        break;
      case 'Enter':
        if (showDropdown) {
          e.preventDefault();
          if (users[selectedIndex]) {
            handleUserSelect(users[selectedIndex]);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        setSearchQuery('');
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current && showDropdown) {
      const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, showDropdown]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const lineHeight = 24;
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value, minRows, maxRows]);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all ${className}`}
        style={{ minHeight: `${minRows * 24}px` }}
      />

      {/* Tag Chips Display (below textarea) */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, index) => (
            <motion.div
              key={`${tag.userId}-${index}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold"
            >
              <User className="w-3 h-3" />
              <span>@{tag.username}</span>
              <button
                onClick={() => {
                  const updatedTags = tags.filter((_, i) => i !== index);
                  setTags(updatedTags);
                  onTagsChange(updatedTags);
                }}
                className="hover:bg-indigo-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dropdown for user suggestions */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg mt-2 max-h-64 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm">Searching users...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="py-2">
                <div className="px-3 py-2 text-xs text-gray-500 font-semibold border-b">
                  Select a user to tag
                </div>
                {users.map((user, index) => (
                  <button
                    key={user.id || user._id}
                    data-index={index}
                    onClick={() => handleUserSelect(user)}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {(user.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <div className="p-4 text-center text-gray-500">
                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No users found for "{searchQuery}"</p>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserTagInput;
