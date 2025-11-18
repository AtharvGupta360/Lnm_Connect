import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserCheck, Clock, UserMinus, Check, X } from 'lucide-react';
import { followService } from '../services/followService';

/**
 * Dynamic Follow Button Component
 * Shows different states: Connect, Pending, Following, Connected, Accept/Reject
 */
const FollowButton = ({ currentUserId, targetUserId, className = '', onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      loadFollowStatus();
    }
  }, [currentUserId, targetUserId]);

  const loadFollowStatus = async () => {
    try {
      setLoading(true);
      const data = await followService.getFollowStatus(currentUserId, targetUserId);
      console.log('Follow status loaded:', { currentUserId, targetUserId, status: data });
      setStatus(data);
    } catch (error) {
      console.error('Error loading follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setActionLoading(true);
      await followService.sendFollowRequest(currentUserId, targetUserId);
      await loadFollowStatus();
      if (onStatusChange) onStatusChange('follow_sent');
      // Show success feedback
      alert('Connection request sent!');
    } catch (error) {
      console.error('Error sending follow request:', error);
      const errorMsg = error.response?.data?.error || 'Failed to send connection request';
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    const message = status?.isPending 
      ? 'Cancel connection request?' 
      : 'Remove connection?';
    
    if (!confirm(message)) return;
    
    try {
      setActionLoading(true);
      await followService.unfollowUser(currentUserId, targetUserId);
      await loadFollowStatus();
      if (onStatusChange) onStatusChange('unfollowed');
      alert(status?.isPending ? 'Request cancelled' : 'Connection removed');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      alert('Failed to remove connection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      setActionLoading(true);
      // Use incomingFollowId for accepting incoming requests
      const requestId = status.incomingFollowId || status.followId;
      await followService.acceptRequest(requestId, currentUserId);
      await loadFollowStatus();
      if (onStatusChange) onStatusChange('accepted');
      alert('Connection request accepted! 🎉');
    } catch (error) {
      console.error('Error accepting request:', error);
      const errorMsg = error.response?.data?.error || 'Failed to accept request';
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setActionLoading(true);
      // Use incomingFollowId for rejecting incoming requests
      const requestId = status.incomingFollowId || status.followId;
      await followService.rejectRequest(requestId, currentUserId);
      await loadFollowStatus();
      if (onStatusChange) onStatusChange('rejected');
      alert('Connection request declined');
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMsg = error.response?.data?.error || 'Failed to reject request';
      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Don't show button for same user
  if (currentUserId === targetUserId) return null;

  if (loading) {
    return (
      <button className={`px-4 py-2 rounded-lg bg-gray-200 text-gray-500 ${className}`} disabled>
        Loading...
      </button>
    );
  }

  // Case 1: User has pending request FROM target user (show Accept/Reject)
  if (status?.hasPendingRequest) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAccept}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          Accept
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReject}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
          Reject
        </motion.button>
      </div>
    );
  }

  // Case 2: User sent request (Pending) - Can cancel
  if (status?.isPending) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUnfollow}
        disabled={actionLoading}
        className={`flex items-center gap-2 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-2 border-yellow-300 rounded-lg font-semibold transition-colors ${className}`}
        title="Click to cancel request"
      >
        <Clock className="w-5 h-5" />
        Pending Request
      </motion.button>
    );
  }

  // Case 3: Already following (show if mutual connection or just following)
  if (status?.isFollowing) {
    const isMutualConnection = status?.isFollower && status?.isFollowing;
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUnfollow}
        disabled={actionLoading}
        className={`flex items-center gap-2 px-4 py-2 ${
          isMutualConnection
            ? 'bg-green-50 hover:bg-green-100 text-green-700 border-2 border-green-300'
            : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-2 border-indigo-300'
        } rounded-lg font-semibold transition-colors ${className}`}
        title={isMutualConnection ? 'Mutual connection - Click to remove' : 'You are following - Click to unfollow'}
      >
        <UserCheck className="w-5 h-5" />
        {isMutualConnection ? 'Connected' : 'Following'}
      </motion.button>
    );
  }

  // Case 4: Not following (Show Connect button)
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleFollow}
      disabled={actionLoading}
      className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 ${className}`}
    >
      <UserPlus className="w-5 h-5" />
      Connect
    </motion.button>
  );
};

export default FollowButton;
