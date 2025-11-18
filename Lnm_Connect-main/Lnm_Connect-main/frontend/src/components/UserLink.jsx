import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * UserLink Component
 * 
 * A reusable component that wraps user-related elements (names, avatars, etc.)
 * and makes them clickable to navigate to the user's profile.
 * 
 * Features:
 * - Keyboard accessible (Enter/Space keys)
 * - Proper ARIA labels for screen readers
 * - Visual hover/focus states
 * - Prevents event bubbling to parent elements
 * 
 * @param {Object} props
 * @param {string} props.userId - The ID of the user to navigate to
 * @param {React.ReactNode} props.children - The content to wrap (name, avatar, etc.)
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.userName] - User's name for accessibility label
 * @param {Function} [props.onClick] - Optional additional click handler
 * @param {boolean} [props.disabled] - Disable navigation (default: false)
 */
const UserLink = ({ 
  userId, 
  children, 
  className = '', 
  userName = 'user',
  onClick,
  disabled = false 
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Call optional onClick handler
    if (onClick) {
      onClick(e);
    }
    
    // Navigate to user profile
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    
    // Handle Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleClick(e);
    }
  };

  if (disabled || !userId) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded ${className}`}
      aria-label={`View ${userName}'s profile`}
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      {children}
    </span>
  );
};

/**
 * Helper function for programmatic navigation to user profile
 * Use this in contexts where you can't wrap JSX with UserLink
 */
export const navigateToUserProfile = (userId, navigate) => {
  if (userId && navigate) {
    navigate(`/profile/${userId}`);
  }
};

export default UserLink;
