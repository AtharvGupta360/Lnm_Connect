import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  useCallStateHooks,
  ParticipantView,
  SpeakerLayout,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { Phone, Mic, MicOff, Volume2, VolumeX, X, Users, UserPlus } from 'lucide-react';
import { api } from '../services/api';

const StreamVoiceChannel = ({ onClose, currentUserId, currentUserName, channelId = 'lnm-connect-main' }) => {
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);
  const [audioVolume, setAudioVolume] = useState(1);
  const hasJoinedRef = React.useRef(false);

  useEffect(() => {
    // Prevent duplicate initialization
    if (hasJoinedRef.current) return;
    
    let mounted = true;
    let streamCall = null;
    let streamClient = null;
    
    const initializeStream = async () => {
      try {
        // Ensure userId is a string and sanitize it for Stream
        const sanitizedUserId = String(currentUserId).replace(/[^a-zA-Z0-9_-]/g, '_');
        const userName = currentUserName || `User_${sanitizedUserId}`;

        // Fetch Stream token from backend
        const response = await api.getStreamToken(sanitizedUserId);
        const { token, apiKey } = response.data;

        if (!mounted) return;

        // Initialize Stream client with generated token
        streamClient = new StreamVideoClient({
          apiKey: apiKey,
          user: {
            id: sanitizedUserId,
            name: userName,
          },
          token: token,
        });

        if (!mounted) return;
        setClient(streamClient);

        // Create or join a call - use 'default' call type which has open permissions
        // 'default' allows all users to join without special permissions
        streamCall = streamClient.call('default', channelId);
        
        // Mark as joined before calling join to prevent race conditions
        hasJoinedRef.current = true;
        
        // Join with create: true allows any user to create or join the channel
        // Ring set to false for instant join without ringing
        await streamCall.join({ 
          create: true,
          ring: false
        });
        
        if (!mounted) {
          await streamCall.leave();
          return;
        }
        
        // Disable camera/video completely - no video in voice channel
        try {
          await streamCall.camera.disable();
        } catch (err) {
          console.log('Camera already disabled or not available');
        }
        
        // Enable microphone for audio-only
        await streamCall.microphone.enable();
        
        setCall(streamCall);
        setIsConnecting(false);
      } catch (error) {
        console.error('Error initializing Stream:', error);
        setError(error.message || 'Failed to connect to voice channel');
        setIsConnecting(false);
        hasJoinedRef.current = false; // Reset on error
      }
    };

    initializeStream();

    // Cleanup on unmount
    return () => {
      mounted = false;
      hasJoinedRef.current = false;
      
      if (streamCall) {
        streamCall.leave().catch(console.error);
      }
      if (streamClient) {
        streamClient.disconnectUser().catch(console.error);
      }
    };
  }, []); // Empty dependency array to run only once

  const handleMuteToggle = async () => {
    if (call) {
      if (isMuted) {
        await call.microphone.enable();
      } else {
        await call.microphone.disable();
      }
      setIsMuted(!isMuted);
    }
  };

  const handleDeafenToggle = () => {
    if (call) {
      // Toggle audio by muting/unmuting all remote participants
      const newDeafenState = !isDeafened;
      setIsDeafened(newDeafenState);
      
      // Set volume to 0 when deafened, restore to 1 when not deafened
      if (newDeafenState) {
        setAudioVolume(0);
        // Mute all audio elements
        document.querySelectorAll('audio').forEach(audio => {
          audio.muted = true;
          audio.volume = 0;
        });
      } else {
        setAudioVolume(1);
        // Unmute all audio elements
        document.querySelectorAll('audio').forEach(audio => {
          audio.muted = false;
          audio.volume = 1;
        });
      }
    }
  };

  const handleLeave = async () => {
    try {
      if (call) {
        await call.leave();
      }
      if (client) {
        await client.disconnectUser();
      }
    } catch (error) {
      console.error('Error leaving call:', error);
    } finally {
      hasJoinedRef.current = false;
      onClose();
    }
  };

  if (!client || !call) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
      >
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md">
          <div className="flex flex-col items-center space-y-4">
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-700 font-medium">Connecting to voice channel...</p>
              </>
            ) : (
              <>
                <div className="text-red-500 text-5xl">⚠️</div>
                <p className="text-gray-700 font-medium">Failed to connect</p>
                {error && <p className="text-gray-500 text-sm text-center">{error}</p>}
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <VoiceChannelUI
          isMuted={isMuted}
          isDeafened={isDeafened}
          onMuteToggle={handleMuteToggle}
          onDeafenToggle={handleDeafenToggle}
          onLeave={handleLeave}
        />
      </StreamCall>
    </StreamVideo>
  );
};

const VoiceChannelUI = ({ isMuted, isDeafened, onMuteToggle, onDeafenToggle, onLeave }) => {
  const { useParticipants, useCallSession } = useCallStateHooks();
  const participants = useParticipants();
  const session = useCallSession();
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Log participants for debugging
  useEffect(() => {
    console.log('Participants:', participants);
    console.log('Remote participants:', participants.filter(p => !p.isLocalParticipant));
  }, [participants]);

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onLeave}
    >
      {/* Hidden audio elements for remote participants */}
      {participants
        .filter(p => !p.isLocalParticipant)
        .map((participant) => (
          <ParticipantView
            key={participant.sessionId}
            participant={participant}
            ParticipantViewUI={null}
          />
        ))}
      
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Voice Channel</h3>
              <p className="text-white/80 text-xs">
                {participants.length} {participants.length === 1 ? 'participant' : 'participants'}
              </p>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Participants List */}
        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {participants.map((participant) => (
            <motion.div
              key={participant.sessionId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-700/50 rounded-xl p-4 flex items-center space-x-3 backdrop-blur-sm border border-slate-600/50"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {participant.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{participant.name || 'Anonymous'}</p>
                <p className="text-gray-400 text-xs">
                  {participant.isSpeaking ? '🎤 Speaking...' : 
                   participant.audioEnabled ? '✓ Connected' : '🔇 Muted'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 px-6 py-5 border-t border-slate-700 flex items-center justify-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMuteToggle}
            className={`p-4 rounded-xl transition-all ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {isMuted ? (
              <MicOff className="w-6 h-6 text-white" />
            ) : (
              <Mic className="w-6 h-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onDeafenToggle}
            className={`p-4 rounded-xl transition-all ${
              isDeafened
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            {isDeafened ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInvite}
            className="p-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all"
            title="Invite users"
          >
            <UserPlus className="w-6 h-6 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLeave}
            className="p-4 rounded-xl bg-red-500 hover:bg-red-600 transition-all"
          >
            <Phone className="w-6 h-6 text-white transform rotate-[135deg]" />
          </motion.button>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10" onClick={() => setShowInviteModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-bold text-lg mb-4">Invite to Call</h3>
              <p className="text-gray-400 text-sm mb-4">
                Invite feature coming soon! You'll be able to send call invitations to other users.
              </p>
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StreamVoiceChannel;
