import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:8080/api/voice-channels';

const CreateVoiceChannelModal = ({ currentUserId, connections, onClose, onChannelCreated }) => {
  const [channelName, setChannelName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [step, setStep] = useState(1); // 1: name, 2: invite users
  const [creating, setCreating] = useState(false);

  // Debug logging
  console.log('CreateVoiceChannelModal - connections prop:', connections);
  console.log('CreateVoiceChannelModal - connections length:', connections?.length);
  console.log('CreateVoiceChannelModal - connections type:', typeof connections, Array.isArray(connections));

  const handleCreateAndInvite = async () => {
    if (!channelName.trim()) {
      alert('Please enter a channel name');
      return;
    }

    setCreating(true);
    try {
      // Create channel
      const createResponse = await fetch(`${API_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId: currentUserId,
          channelName: channelName.trim()
        })
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create channel');
      }

      const channel = await createResponse.json();

      // Invite selected users
      if (selectedUsers.length > 0) {
        await fetch(`${API_URL}/${channel.id}/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inviterId: currentUserId,
            userIds: selectedUsers
          })
        });
      }

      onChannelCreated(channel);
      onClose();
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create voice channel');
    } finally {
      setCreating(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Phone size={24} />
            <h2 className="text-xl font-bold">
              {step === 1 ? 'Create Voice Channel' : 'Invite Connections'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Enter channel name..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                Give your voice channel a name that describes the conversation
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Select connections to invite (optional)
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {(!connections || connections.length === 0) ? (
                  <p className="text-gray-500 text-center py-4">No connections available</p>
                ) : (
                  connections.map((conn) => (
                    <label
                      key={conn.userId}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(conn.userId)}
                        onChange={() => toggleUserSelection(conn.userId)}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <img
                        src={conn.photoUrl || `https://ui-avatars.com/api/?name=${conn.name}`}
                        alt={conn.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium">{conn.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!channelName.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Back
              </button>
              <button
                onClick={handleCreateAndInvite}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create & Join'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreateVoiceChannelModal;
