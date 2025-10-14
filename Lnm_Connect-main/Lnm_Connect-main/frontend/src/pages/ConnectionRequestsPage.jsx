import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, X, Loader2, UserPlus, AlertCircle } from 'lucide-react';
import { followService } from '../services/followService';
import { Link } from 'react-router-dom';

const ConnectionRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadRequests();
    }
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await followService.getPendingRequests(currentUser.id);
      setRequests(data);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setProcessingId(requestId);
      await followService.acceptRequest(requestId, currentUser.id);
      setRequests(requests.filter(r => r.requestId !== requestId));
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setProcessingId(requestId);
      await followService.rejectRequest(requestId, currentUser.id);
      setRequests(requests.filter(r => r.requestId !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Connection Requests</h1>
              <p className="text-gray-600">
                {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Requests</h3>
            <p className="text-gray-500">
              You don't have any connection requests at the moment.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {requests.map((request, index) => (
                <motion.div
                  key={request.requestId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Link to={`/profile/${request.userId}`}>
                      <motion.img
                        whileHover={{ scale: 1.1 }}
                        src={
                          request.userPhotoUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            request.userName
                          )}&background=4f46e5&color=fff&size=80`
                        }
                        alt={request.userName}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-100"
                      />
                    </Link>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/profile/${request.userId}`}
                        className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {request.userName}
                      </Link>
                      {request.education && (
                        <p className="text-sm text-gray-600">
                          {request.education}
                          {request.branchYear && ` • ${request.branchYear}`}
                        </p>
                      )}
                      {request.bio && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{request.bio}</p>
                      )}
                      {request.mutualConnections > 0 && (
                        <p className="text-xs text-indigo-600 mt-2 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {request.mutualConnections} mutual connection
                          {request.mutualConnections !== 1 ? 's' : ''}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(request.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAccept(request.requestId)}
                        disabled={processingId === request.requestId}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingId === request.requestId ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                        Accept
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(request.requestId)}
                        disabled={processingId === request.requestId}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-5 h-5" />
                        Ignore
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequestsPage;
