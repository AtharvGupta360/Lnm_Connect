import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, UserPlus, MessageCircle, Loader2, UserMinus, Bell, Check, X } from 'lucide-react';
import { followService } from '../services/followService';
import { Link, useNavigate } from 'react-router-dom';
import MessageButton from '../components/MessageButton';
import UserLink from '../components/UserLink';

const MyNetworkPage = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [connections, setConnections] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0, connections: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const navigate = useNavigate();

  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadNetworkData();
    }
  }, [activeTab]);

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      
      // Load counts
      const countsData = await followService.getUserCounts(currentUser.id);
      
      // Load pending requests count
      const requests = await followService.getPendingRequests(currentUser.id);
      
      setCounts({
        ...countsData,
        pending: requests.length
      });

      // Load data based on active tab
      if (activeTab === 'pending') {
        setPendingRequests(requests);
      } else if (activeTab === 'connections') {
        const data = await followService.getConnections(currentUser.id);
        setConnections(data);
      } else if (activeTab === 'followers') {
        const data = await followService.getFollowers(currentUser.id);
        setFollowers(data);
      } else if (activeTab === 'following') {
        const data = await followService.getFollowing(currentUser.id);
        setFollowing(data);
      }
    } catch (error) {
      console.error('Error loading network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (userId) => {
    if (!confirm('Are you sure you want to remove this connection?')) return;

    try {
      setRemovingId(userId);
      await followService.unfollowUser(currentUser.id, userId);
      
      // Refresh data
      await loadNetworkData();
    } catch (error) {
      console.error('Error removing connection:', error);
      alert('Failed to remove connection');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      setProcessingId(requestId);
      await followService.acceptRequest(requestId, currentUser.id);
      alert('Connection request accepted! 🎉');
      
      // Refresh data
      await loadNetworkData();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setProcessingId(requestId);
      await followService.rejectRequest(requestId, currentUser.id);
      alert('Connection request declined');
      
      // Refresh data
      await loadNetworkData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending Requests', count: counts.pending, icon: Bell },
    { id: 'connections', label: 'Connections', count: counts.connections, icon: UserCheck },
    { id: 'followers', label: 'Followers', count: counts.followers, icon: Users },
    { id: 'following', label: 'Following', count: counts.following, icon: UserPlus }
  ];

  const currentData = activeTab === 'pending' ? pendingRequests : activeTab === 'connections' ? connections : activeTab === 'followers' ? followers : following;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Network</h1>
              <p className="text-gray-600">Manage your connections and network</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : currentData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-500">
              {activeTab === 'connections' && "Start connecting with people to build your network!"}
              {activeTab === 'followers' && "No one is following you yet. Share your profile!"}
              {activeTab === 'following' && "You're not following anyone yet. Discover people to connect with!"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {currentData.map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6"
                >
                  {/* Avatar */}
                  <UserLink userId={user.userId} userName={user.name}>
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      src={
                        user.photoUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name
                        )}&background=4f46e5&color=fff&size=128`
                      }
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-indigo-100 cursor-pointer"
                    />
                  </UserLink>

                  {/* User Info */}
                  <div className="text-center">
                    <UserLink
                      userId={user.userId}
                      userName={user.name}
                      className="text-lg font-bold text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {user.name}
                    </UserLink>
                    {user.education && (
                      <p className="text-sm text-gray-600 mt-1">
                        {user.education}
                        {user.branchYear && ` • ${user.branchYear}`}
                      </p>
                    )}
                    {user.bio && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{user.bio}</p>
                    )}

                    {/* Connection Status Badges */}
                    <div className="flex justify-center gap-2 mt-3">
                      {user.isConnected && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          ✓ Connected
                        </span>
                      )}
                      {user.mutualConnections > 0 && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {user.mutualConnections} mutual
                        </span>
                      )}
                    </div>

                    {/* Skills Preview */}
                    {user.skills && user.skills.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {user.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {user.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            +{user.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {activeTab === 'pending' ? (
                      <>
                        {/* Accept Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAcceptRequest(user.requestId)}
                          disabled={processingId === user.requestId}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {processingId === user.requestId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Accept
                            </>
                          )}
                        </motion.button>
                        
                        {/* Reject Button */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRejectRequest(user.requestId)}
                          disabled={processingId === user.requestId}
                          className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {processingId === user.requestId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <X className="w-4 h-4" />
                              Reject
                            </>
                          )}
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <MessageButton
                          targetUserId={user.userId}
                          targetUserName={user.name}
                          targetUserPhotoUrl={user.photoUrl}
                          className="flex-1 text-sm"
                        />
                        {activeTab === 'connections' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemoveConnection(user.userId)}
                            disabled={removingId === user.userId}
                            className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove connection"
                          >
                            {removingId === user.userId ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <UserMinus className="w-5 h-5" />
                            )}
                          </motion.button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Connection Date */}
                  {user.connectionDate && (
                    <p className="text-xs text-gray-400 text-center mt-3">
                      Connected on{' '}
                      {new Date(user.connectionDate).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNetworkPage;
