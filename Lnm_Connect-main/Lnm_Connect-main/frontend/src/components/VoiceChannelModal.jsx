import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, X, UserPlus, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { webrtcService } from '../services/webrtcService';

const API_URL = 'http://localhost:8080/api/voice-channels';

const VoiceChannelModal = ({ channel, onClose, currentUserId, connections, stompClient }) => {
  const [participants, setParticipants] = useState(channel?.participants || []);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isTurnOnly, setIsTurnOnly] = useState(() => {
    try { return localStorage.getItem('TURN_ONLY') === '1'; } catch { return false; }
  });
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [connectionStates, setConnectionStates] = useState({});
  const [remoteStreams, setRemoteStreams] = useState({});
  const audioRefs = useRef({});
  const initialized = useRef(false);

  useEffect(() => {
    const initChannel = async () => {
      if (channel && stompClient && !initialized.current) {
        console.log('🎬 Starting voice channel initialization (useEffect)');
        await initializeVoiceChannel();
        initialized.current = true;
        console.log('✅ Voice channel initialization complete (useEffect)');
      }
    };

    initChannel();

    return () => {
      if (initialized.current) {
        console.log('🧹 Cleaning up voice channel (useEffect unmount)');
        cleanupVoiceChannel();
        // Clean up audio elements
        Object.values(audioRefs.current).forEach(audioElement => {
          if (audioElement) {
            audioElement.pause();
            if (audioElement.srcObject) {
              audioElement.srcObject.getTracks().forEach(track => track.stop());
              audioElement.srcObject = null;
            }
            // Remove from document if appended
            if (audioElement.parentNode) {
              audioElement.parentNode.removeChild(audioElement);
            }
          }
        });
        audioRefs.current = {};
      }
    };
  }, [channel?.id, stompClient]);

  useEffect(() => {
    if (channel) {
      fetchChannelDetails();
      // Poll for updates every 3 seconds
      const interval = setInterval(fetchChannelDetails, 3000);
      return () => clearInterval(interval);
    }
  }, [channel?.id]);

  // Play remote audio streams
  useEffect(() => {
    Object.entries(remoteStreams).forEach(([userId, stream]) => {
      let audioElement = audioRefs.current[userId];
      
      // Create audio element if it doesn't exist
      if (!audioElement) {
        console.log(`Creating audio element for ${userId}`);
        audioElement = document.createElement('audio');
        audioElement.autoplay = true;
        audioElement.playsInline = true;
        audioRefs.current[userId] = audioElement;
        // Append to document so it can play
        document.body.appendChild(audioElement);
      }
      
      if (audioElement) {
        console.log(`Setting up audio for user ${userId}`);
        console.log(`Stream has ${stream.getTracks().length} tracks:`, stream.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted
        })));
        
        // Set the stream
        if (audioElement.srcObject !== stream) {
          try {
            audioElement.srcObject = stream;
            audioElement.volume = 1.0;
            audioElement.muted = isDeafened;
            
            console.log(`Audio element configured for ${userId}, attempting to play...`);
            
            // Try to play
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log(`✅ Successfully playing audio from ${userId}`);
                  console.log(`Audio element state: paused=${audioElement.paused}, muted=${audioElement.muted}, volume=${audioElement.volume}`);
                })
                .catch(err => {
                  console.error(`❌ Error playing audio from ${userId}:`, err.name, err.message);
                  
                  // Try with user interaction
                  const playOnClick = () => {
                    console.log(`Attempting to play audio after user interaction for ${userId}`);
                    audioElement.play()
                      .then(() => {
                        console.log(`✅ Audio started after user interaction for ${userId}`);
                        document.removeEventListener('click', playOnClick);
                      })
                      .catch(e => console.error(`Still failed after click:`, e));
                  };
                  document.addEventListener('click', playOnClick, { once: true });
                  console.log(`⚠️ Waiting for user click to start audio...`);
                });
            }
          } catch (error) {
            console.error(`Error setting srcObject for ${userId}:`, error);
          }
        }
        
        // Check audio track
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          console.log(`Audio track for ${userId}:`, {
            enabled: audioTracks[0].enabled,
            readyState: audioTracks[0].readyState,
            muted: audioTracks[0].muted,
            label: audioTracks[0].label
          });
        } else {
          console.warn(`❌ No audio tracks in stream from ${userId}`);
        }
      }
    });
  }, [remoteStreams, isDeafened]);

  const initializeVoiceChannel = async () => {
    try {
      console.log('Initializing voice channel...');
      console.log('Channel:', channel);
      console.log('StompClient:', stompClient);
      console.log('Current User ID:', currentUserId);
      
      // Check if stompClient is connected
      if (!stompClient || !stompClient.connected) {
        console.error('StompClient is not connected');
        alert('WebSocket connection is not ready. Please wait a moment and try again.');
        return;
      }
      
      // Apply TURN-only mode before initialization
      webrtcService.setTurnOnly(isTurnOnly);

      // Initialize WebRTC service (wait for subscriptions to be ready)
      console.log('Initializing WebRTC service and subscriptions...');
      await webrtcService.initialize(stompClient, channel.id, currentUserId);
      console.log('WebRTC service initialized, subscriptions ready');

      // Get user media
      console.log('Requesting user media...');
      await webrtcService.getUserMedia();
      console.log('User media obtained successfully');

      // Setup callbacks
      webrtcService.onStream((userId, stream) => {
        console.log(`Received stream from ${userId}`);
        setRemoteStreams(prev => ({ ...prev, [userId]: stream }));
      });

      webrtcService.onConnectionStateChange((userId, state) => {
        console.log(`Connection state for ${userId}: ${state}`);
        setConnectionStates(prev => ({ ...prev, [userId]: state }));
      });

      webrtcService.onPeerLeft((userId) => {
        console.log(`Peer ${userId} left`);
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[userId];
          return newStreams;
        });
        setConnectionStates(prev => {
          const newStates = { ...prev };
          delete newStates[userId];
          return newStates;
        });
      });

      // Connect to existing participants
      const existingParticipants = participants
        .map(p => p.userId)
        .filter(id => id !== currentUserId);
      
      console.log('Existing participants to connect:', existingParticipants);
      
      // First notify others that we joined (so they receive the broadcast)
      webrtcService.notifyJoined();
      
      if (existingParticipants.length > 0) {
        webrtcService.connectToParticipants(existingParticipants);
      }

      console.log('Voice channel initialized successfully');
    } catch (error) {
      console.error('Error initializing voice channel:', error);
      alert('Failed to access microphone. Please check your permissions.');
    }
  };

  const cleanupVoiceChannel = () => {
    console.log('Cleaning up voice channel...');
    webrtcService.leave();
    initialized.current = false;
  };

  const fetchChannelDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/${channel.id}`);
      const data = await response.json();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error fetching channel details:', error);
    }
  };

  const handleLeaveChannel = async () => {
    try {
      await fetch(`${API_URL}/${channel.id}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });
      cleanupVoiceChannel();
      onClose();
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    webrtcService.setAudioEnabled(!newMutedState);
  };

  const handleToggleDeafen = () => {
    const newDeafenedState = !isDeafened;
    setIsDeafened(newDeafenedState);
    
    // Mute/unmute all remote audio elements
    Object.values(audioRefs.current).forEach(audioElement => {
      if (audioElement) {
        audioElement.muted = newDeafenedState;
      }
    });
  };

  // Toggle TURN-only mode (restarts voice channel to apply)
  const handleToggleTurnOnly = async () => {
    const next = !isTurnOnly;
    setIsTurnOnly(next);
    try { localStorage.setItem('TURN_ONLY', next ? '1' : '0'); } catch {}
    if (initialized.current) {
      console.log(`🔁 Applying TURN-only=${next}. Restarting voice channel...`);
      cleanupVoiceChannel();
      initialized.current = false;
      await initializeVoiceChannel();
      initialized.current = true;
    }
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await fetch(`${API_URL}/${channel.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviterId: currentUserId,
          userIds: selectedUsers
        })
      });
      setShowInviteModal(false);
      setSelectedUsers([]);
      alert('Invitations sent successfully!');
    } catch (error) {
      console.error('Error inviting users:', error);
      alert('Failed to send invitations');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Filter out users already in the channel or already invited
  const availableConnections = connections.filter(
    conn => !participants.some(p => p.userId === conn.userId)
  );

  return (
    <>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, x: '-50%', y: '-50%' }}
        animate={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
        exit={{ scale: 0.9, opacity: 0, x: '-50%', y: '-50%' }}
        className="fixed top-1/2 left-1/2 bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 overflow-hidden z-50"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{channel?.name || 'Voice Channel'}</h2>
            <p className="text-sm opacity-90">{participants.length} participant{participants.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Participants */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Participants</h3>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition"
            >
              <UserPlus size={18} />
              Invite
            </button>
          </div>
          <div className="space-y-3">
            {participants.map((participant) => {
              const isConnected = connectionStates[participant.userId] === 'connected';
              const hasAudio = !!remoteStreams[participant.userId];
              
              return (
                <div
                  key={participant.userId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="relative">
                    <img
                      src={participant.photoUrl || `https://ui-avatars.com/api/?name=${participant.userName}`}
                      alt={participant.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {participant.userId !== currentUserId && (
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        isConnected ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{participant.userName}</p>
                    <div className="flex items-center gap-2">
                      {participant.userId === channel.creatorId && (
                        <span className="text-xs text-indigo-600 font-semibold">Host</span>
                      )}
                      {participant.userId !== currentUserId && (
                        <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                          {isConnected ? 'Connected' : 'Connecting...'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {participant.userId === currentUserId ? (
                      <>
                        {isMuted && <MicOff size={18} className="text-red-500" />}
                        {isDeafened && <VolumeX size={18} className="text-red-500" />}
                      </>
                    ) : (
                      <>
                        {participant.isMuted && <MicOff size={18} className="text-red-500" />}
                        {!hasAudio && isConnected && <VolumeX size={18} className="text-gray-400" />}
                      </>
                    )}
                  </div>
                  {/* Hidden audio element for remote stream */}
                  {participant.userId !== currentUserId && (
                    <audio
                      ref={el => {
                        if (el) {
                          audioRefs.current[participant.userId] = el;
                          // Ensure audio element is ready
                          el.volume = 1.0;
                          el.muted = false;
                        }
                      }}
                      autoPlay
                      playsInline
                      controls={false}
                      style={{ display: 'none' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-center gap-4">
          {/* TURN-only debug toggle */}
          <button
            onClick={handleToggleTurnOnly}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border ${isTurnOnly ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-white text-gray-600 border-gray-300'}`}
            title="Force TURN-only (relay) for strict NAT/firewalls"
          >
            {isTurnOnly ? 'TURN-only: ON' : 'TURN-only: OFF'}
          </button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleMute}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-300'} text-white transition`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleDeafen}
            className={`p-4 rounded-full ${isDeafened ? 'bg-red-500' : 'bg-gray-300'} text-white transition`}
            title={isDeafened ? 'Undeafen' : 'Deafen'}
          >
            {isDeafened ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLeaveChannel}
            className="p-4 rounded-full bg-red-600 text-white transition"
            title="Leave Channel"
          >
            <PhoneOff size={24} />
          </motion.button>
        </div>
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Invite Connections</h3>
              <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                {availableConnections.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No connections available to invite</p>
                ) : (
                  availableConnections.map((conn) => (
                    <label
                      key={conn.userId}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(conn.userId)}
                        onChange={() => toggleUserSelection(conn.userId)}
                        className="w-5 h-5"
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
              <div className="flex gap-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUsers}
                  disabled={selectedUsers.length === 0}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Invites ({selectedUsers.length})
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceChannelModal;
