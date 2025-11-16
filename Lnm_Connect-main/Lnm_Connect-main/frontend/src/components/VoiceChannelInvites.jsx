import React, { useState, useEffect } from 'react';
import { Phone, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:8080/api/voice-channels';

const VoiceChannelInvites = ({ currentUserId, onJoinChannel }) => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingInvites();
    // Poll for new invites every 10 seconds
    const interval = setInterval(fetchPendingInvites, 10000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  const fetchPendingInvites = async () => {
    try {
      const response = await fetch(`${API_URL}/invites/pending?userId=${currentUserId}`);
      const data = await response.json();
      setInvites(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching invites:', error);
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId, channelId) => {
    try {
      const response = await fetch(`${API_URL}/invites/${inviteId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
      
      if (response.ok) {
        const channel = await response.json();
        setInvites(prev => prev.filter(inv => inv.id !== inviteId));
        onJoinChannel(channel);
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      await fetch(`${API_URL}/invites/${inviteId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
      setInvites(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error('Error rejecting invite:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading invites...
      </div>
    );
  }

  if (invites.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-40 w-96 max-w-full">
      <AnimatePresence>
        {invites.map((invite) => (
          <motion.div
            key={invite.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="mb-3 bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-indigo-500"
          >
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Phone className="text-indigo-600" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">Voice Channel Invite</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">{invite.inviterName}</span> invited you to join
                  </p>
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    {invite.channelName}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAcceptInvite(invite.id, invite.channelId)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-600 transition"
                >
                  <Check size={18} />
                  Join
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRejectInvite(invite.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default VoiceChannelInvites;
