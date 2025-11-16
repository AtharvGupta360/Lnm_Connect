class WebRTCService {
  constructor() {
    this.peers = new Map(); // Map of userId -> RTCPeerConnection
    this.pendingCandidates = new Map(); // Map of userId -> Array of ICE candidates
    this.initiatedConnections = new Set(); // Track users we've already tried to connect with
    this.processingUsers = new Set(); // Track users currently being processed
    this.localStream = null;
    this.stompClient = null;
    this.channelId = null;
    this.currentUserId = null;
    this.onPeerJoinedCallback = null;
    this.onPeerLeftCallback = null;
    this.onStreamCallback = null;
    this.onConnectionStateCallback = null;
    
    // ICE servers configuration
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        // Free TURN server for relaying when direct connection fails
        {
          urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        },
        {
          urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10,
      iceTransportPolicy: 'all', // Try all connection types
    };
  }

  /**
   * Initialize WebRTC with STOMP client for signaling
   */
  initialize(stompClient, channelId, currentUserId) {
    this.stompClient = stompClient;
    this.channelId = channelId;
    this.currentUserId = currentUserId;
    
    // Subscribe to WebRTC signaling messages
    this.subscribeToSignaling();
  }

  /**
   * Get user's media stream (audio only)
   */
  async getUserMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      
      console.log('Got local media stream');
      return this.localStream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }

  /**
   * Subscribe to WebRTC signaling messages via WebSocket
   */
  subscribeToSignaling() {
    // Subscribe to offers
    this.stompClient.subscribe(`/user/queue/voice-channel/offer`, (message) => {
      const data = JSON.parse(message.body);
      this.handleOffer(data);
    });

    // Subscribe to answers
    this.stompClient.subscribe(`/user/queue/voice-channel/answer`, (message) => {
      const data = JSON.parse(message.body);
      this.handleAnswer(data);
    });

    // Subscribe to ICE candidates
    this.stompClient.subscribe(`/user/queue/voice-channel/ice-candidate`, (message) => {
      const data = JSON.parse(message.body);
      this.handleIceCandidate(data);
    });

    // Subscribe to user joined notifications
    this.stompClient.subscribe(`/topic/voice-channel/${this.channelId}/user-joined`, (message) => {
      const data = JSON.parse(message.body);
      if (data.userId !== this.currentUserId) {
        this.handleUserJoined(data.userId);
      }
    });

    // Subscribe to user left notifications
    this.stompClient.subscribe(`/topic/voice-channel/${this.channelId}/user-left`, (message) => {
      const data = JSON.parse(message.body);
      if (data.userId !== this.currentUserId) {
        this.handleUserLeft(data.userId);
      }
    });
  }

  /**
   * Notify other users that we joined the channel
   */
  notifyJoined() {
    console.log(`📢 Broadcasting join notification to channel ${this.channelId}`);
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/voice-channel/${this.channelId}/user-joined`,
        body: JSON.stringify({
          userId: this.currentUserId,
          channelId: this.channelId,
        }),
      });
      console.log(`✅ Join notification sent for user ${this.currentUserId}`);
    } else {
      console.error(`❌ Cannot send join notification - STOMP not connected`);
    }
  }

  /**
   * Create peer connection with another user (initiator)
   */
  async createPeerConnection(userId, isInitiator = true) {
    console.log(`Creating peer connection with ${userId} as ${isInitiator ? 'initiator' : 'receiver'}`);
    
    if (!this.localStream) {
      console.error('Cannot create peer connection: No local stream');
      throw new Error('Local stream not initialized');
    }
    
    // Check if we already have a peer connection with this user
    if (this.peers.has(userId)) {
      console.log(`Peer connection with ${userId} already exists, returning existing connection`);
      return this.peers.get(userId);
    }
    
    try {
      // Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection(this.iceServers);
      
      console.log(`Peer connection created for ${userId}, adding local tracks...`);
      
      // Add local stream tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
        console.log(`Added local ${track.kind} track for ${userId}:`, track.label);
      });

      // Handle incoming tracks (remote audio)
      peerConnection.ontrack = (event) => {
        console.log(`🎵 Received remote track from ${userId}`);
        console.log('Track kind:', event.track.kind);
        console.log('Track enabled:', event.track.enabled);
        console.log('Track readyState:', event.track.readyState);
        console.log('Stream:', event.streams[0]);
        console.log('Stream tracks:', event.streams[0].getTracks());
        
        if (this.onStreamCallback && event.streams[0]) {
          this.onStreamCallback(userId, event.streams[0]);
        } else {
          console.warn('No stream callback or no stream in track event');
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateStr = event.candidate.candidate;
          const candidateType = candidateStr.includes('host') ? '🏠 host' : 
                               candidateStr.includes('srflx') ? '🌐 srflx' : 
                               candidateStr.includes('relay') ? '🔄 relay' : '❓ unknown';
          console.log(`📡 Sending ICE candidate to ${userId} [${candidateType}]:`, candidateStr.substring(0, 60) + '...');
          this.sendIceCandidate(userId, event.candidate);
        } else {
          console.log(`✅ ICE gathering complete for ${userId}`);
        }
      };

      // Handle ICE gathering state
      peerConnection.onicegatheringstatechange = () => {
        console.log(`ICE gathering state for ${userId}: ${peerConnection.iceGatheringState}`);
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        const emoji = state === 'connected' ? '✅' : 
                     state === 'connecting' ? '🔄' : 
                     state === 'failed' ? '❌' : 
                     state === 'disconnected' ? '⚠️' : '🔷';
        console.log(`${emoji} Connection state with ${userId}: ${state}`);
        
        if (this.onConnectionStateCallback) {
          this.onConnectionStateCallback(userId, state);
        }
        
        if (state === 'failed') {
          console.error(`❌ Connection failed with ${userId}`);
          console.error(`ICE connection state: ${peerConnection.iceConnectionState}`);
          console.error(`Signaling state: ${peerConnection.signalingState}`);
          console.error(`This peer connection has failed and needs to be recreated`);
          // Don't auto-restart as it causes state conflicts
        }
        
        if (state === 'disconnected' || state === 'closed') {
          this.peers.delete(userId);
          this.initiatedConnections.delete(userId);
        }
      };

      // Handle ICE connection state
      peerConnection.oniceconnectionstatechange = () => {
        const state = peerConnection.iceConnectionState;
        const emoji = state === 'connected' ? '✅' : 
                     state === 'checking' ? '🔍' : 
                     state === 'failed' ? '❌' : 
                     state === 'disconnected' ? '⚠️' : '🔷';
        console.log(`${emoji} ICE connection state with ${userId}: ${state}`);
        
        if (state === 'failed') {
          console.error(`❌ ICE connection failed with ${userId} - this usually means:`);
          console.error(`   - No valid ICE candidate pairs found`);
          console.error(`   - Firewall blocking connection`);
          console.error(`   - Network connectivity issues`);
        } else if (state === 'connected' || state === 'completed') {
          console.log(`🎉 Successfully established ICE connection with ${userId}`);
        }
      };
      
      // Handle signaling state changes
      peerConnection.onsignalingstatechange = () => {
        console.log(`Signaling state with ${userId}: ${peerConnection.signalingState}`);
      };

      // Store peer connection
      this.peers.set(userId, peerConnection);
      
      // If initiator, create and send offer
      if (isInitiator) {
        console.log(`📤 Creating offer for ${userId}...`);
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await peerConnection.setLocalDescription(offer);
        console.log(`✅ Set local description (offer) for ${userId}. Signaling state: ${peerConnection.signalingState}`);
        console.log(`📤 Sending offer to ${userId}`);
        this.sendOffer(userId, offer);
      } else {
        console.log(`⏸️ Not creating offer for ${userId} (waiting to receive offer)`);
      }
      
      return peerConnection;
    } catch (error) {
      console.error(`Error creating peer connection with ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Send WebRTC offer via WebSocket
   */
  sendOffer(toUserId, offer) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/voice-channel/${this.channelId}/offer`,
        body: JSON.stringify({
          from: this.currentUserId,
          to: toUserId,
          channelId: this.channelId,
          offer: offer,
        }),
      });
    }
  }

  /**
   * Send WebRTC answer via WebSocket
   */
  sendAnswer(toUserId, answer) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/voice-channel/${this.channelId}/answer`,
        body: JSON.stringify({
          from: this.currentUserId,
          to: toUserId,
          channelId: this.channelId,
          answer: answer,
        }),
      });
    }
  }

  /**
   * Send ICE candidate via WebSocket
   */
  sendIceCandidate(toUserId, candidate) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/voice-channel/${this.channelId}/ice-candidate`,
        body: JSON.stringify({
          from: this.currentUserId,
          to: toUserId,
          channelId: this.channelId,
          candidate: candidate,
        }),
      });
    }
  }

  /**
   * Handle incoming WebRTC offer
   */
  async handleOffer(data) {
    const { from, offer } = data;
    console.log(`📥 Received offer from ${from}`);

    try {
      // Check if we already have a peer connection with this user
      let peerConnection = this.peers.get(from);
      
      if (peerConnection) {
        // If we already have a connection, close it first to avoid conflicts
        console.log(`⚠️ Closing existing peer connection with ${from} (state: ${peerConnection.signalingState}) before processing offer`);
        peerConnection.close();
        this.peers.delete(from);
      }
      
      // Create peer connection as non-initiator
      console.log(`Creating peer connection to handle offer from ${from}...`);
      peerConnection = await this.createPeerConnection(from, false);
      
      // Set remote description (the offer)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(`✅ Set remote offer from ${from}. Signaling state: ${peerConnection.signalingState}`);
      
      // Create and send answer
      console.log(`📤 Creating answer for ${from}...`);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log(`✅ Set local description (answer) for ${from}. Signaling state: ${peerConnection.signalingState}`);
      
      console.log(`📤 Sending answer to ${from}`);
      this.sendAnswer(from, answer);
      
      // Process any pending ICE candidates
      const pending = this.pendingCandidates.get(from);
      if (pending && pending.length > 0) {
        console.log(`Processing ${pending.length} pending ICE candidates for ${from}`);
        for (const candidate of pending) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
        this.pendingCandidates.delete(from);
      }
    } catch (error) {
      console.error(`❌ Error handling offer from ${from}:`, error);
    }
  }

  /**
   * Handle incoming WebRTC answer
   */
  async handleAnswer(data) {
    const { from, answer } = data;
    console.log(`📥 Received answer from ${from}`);

    const peerConnection = this.peers.get(from);
    if (!peerConnection) {
      console.warn(`⚠️ No peer connection found for ${from} when receiving answer`);
      return;
    }

    console.log(`Current signaling state with ${from}: ${peerConnection.signalingState}`);
    
    try {
      // Check if we're in the right state to accept an answer
      if (peerConnection.signalingState === 'have-local-offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`✅ Successfully set remote answer from ${from}. New state: ${peerConnection.signalingState}`);
        
        // Process any pending ICE candidates
        const pending = this.pendingCandidates.get(from);
        if (pending && pending.length > 0) {
          console.log(`Processing ${pending.length} pending ICE candidates for ${from}`);
          for (const candidate of pending) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
          this.pendingCandidates.delete(from);
        }
      } else if (peerConnection.signalingState === 'stable') {
        console.warn(`⚠️ Ignoring duplicate answer from ${from} - connection already stable`);
      } else {
        console.error(`❌ Cannot set remote answer from ${from}: wrong state (${peerConnection.signalingState}). Expected 'have-local-offer'.`);
        console.error(`This means we never sent an offer, or received answer in unexpected state.`);
      }
    } catch (error) {
      console.error(`❌ Error handling answer from ${from}:`, error);
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  async handleIceCandidate(data) {
    const { from, candidate } = data;
    
    const candidateStr = candidate.candidate || '';
    const candidateType = candidateStr.includes('host') ? '🏠 host' : 
                         candidateStr.includes('srflx') ? '🌐 srflx' : 
                         candidateStr.includes('relay') ? '🔄 relay' : '❓ unknown';
    console.log(`📥 Received ICE candidate from ${from} [${candidateType}]`);

    const peerConnection = this.peers.get(from);
    if (peerConnection) {
      try {
        // Only add ICE candidate if remote description is set
        if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          console.log(`✅ Added ICE candidate from ${from}`);
        } else {
          // Queue the candidate for later
          console.log(`⏸️ Queueing ICE candidate from ${from} (remote description not set yet)`);
          if (!this.pendingCandidates.has(from)) {
            this.pendingCandidates.set(from, []);
          }
          this.pendingCandidates.get(from).push(candidate);
        }
      } catch (error) {
        console.error(`❌ Error adding ICE candidate from ${from}:`, error);
      }
    } else {
      console.warn(`No peer connection found for ${from}, queueing candidate`);
      // Queue for when connection is created
      if (!this.pendingCandidates.has(from)) {
        this.pendingCandidates.set(from, []);
      }
      this.pendingCandidates.get(from).push(candidate);
    }
  }

  /**
   * Handle new user joining the channel
   * When a new user joins, THEY will initiate connections with us
   * We just need to wait for their offer
   */
  async handleUserJoined(userId) {
    console.log(`👤 User ${userId} joined the channel (they will initiate connection with us)`);
    
    // Just add to UI, the new user will send us an offer
    if (this.onPeerJoinedCallback) {
      this.onPeerJoinedCallback(userId);
    }
  }

  /**
   * Handle user leaving the channel
   */
  handleUserLeft(userId) {
    console.log(`👋 User ${userId} left the channel`);
    
    // Close peer connection
    const peerConnection = this.peers.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(userId);
    }
    
    // Clear pending candidates
    this.pendingCandidates.delete(userId);
    
    // Clear initiation tracking
    this.initiatedConnections.delete(userId);
    
    // Clear processing flag
    this.processingUsers.delete(userId);
    
    if (this.onPeerLeftCallback) {
      this.onPeerLeftCallback(userId);
    }
  }

  /**
   * Connect to existing participants in the channel
   * New user joining initiates connections with all existing participants
   */
  async connectToParticipants(participantIds) {
    console.log('🚀 New user connecting to existing participants:', participantIds);
    
    if (!this.localStream) {
      console.error('Cannot connect to participants: No local stream');
      return;
    }
    
    // If there are existing participants, WE are the new user and must initiate
    const shouldInitiate = participantIds.length > 0;
    console.log(`Should initiate connections: ${shouldInitiate} (we are ${shouldInitiate ? 'NEW' : 'FIRST'} user)`);
    
    if (shouldInitiate) {
      for (const userId of participantIds) {
        if (userId !== this.currentUserId) {
          // Check if we already have a connection
          if (this.peers.has(userId)) {
            console.log(`⚠️ Already have peer connection with ${userId}, skipping`);
            continue;
          }
          
          // Check if we've already initiated
          if (this.initiatedConnections.has(userId)) {
            console.log(`⚠️ Already initiated connection with ${userId}, skipping`);
            continue;
          }
          
          // Mark as initiated
          this.initiatedConnections.add(userId);
          
          console.log(`📤 Initiating connection with existing participant ${userId}`);
          
          try {
            await this.createPeerConnection(userId, true);
          } catch (error) {
            console.error(`❌ Failed to create connection with ${userId}:`, error);
            this.initiatedConnections.delete(userId);
          }
        }
      }
    }
  }

  /**
   * Mute/unmute local audio
   */
  setAudioEnabled(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
      console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Get audio track enabled state
   */
  isAudioEnabled() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      return audioTrack ? audioTrack.enabled : false;
    }
    return false;
  }

  /**
   * Leave the voice channel and cleanup
   */
  leave() {
    console.log('Leaving voice channel');
    
    // Notify other users
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: `/app/voice-channel/${this.channelId}/user-left`,
        body: JSON.stringify({
          userId: this.currentUserId,
          channelId: this.channelId,
        }),
      });
    }

    // Close all peer connections
    this.peers.forEach((peerConnection) => {
      peerConnection.close();
    });
    this.peers.clear();
    
    // Clear pending candidates
    this.pendingCandidates.clear();
    
    // Clear initiation tracking
    this.initiatedConnections.clear();
    
    // Clear processing users
    this.processingUsers.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Reset state
    this.channelId = null;
    this.currentUserId = null;
  }

  /**
   * Set callback for when a peer joins
   */
  onPeerJoined(callback) {
    this.onPeerJoinedCallback = callback;
  }

  /**
   * Set callback for when a peer leaves
   */
  onPeerLeft(callback) {
    this.onPeerLeftCallback = callback;
  }

  /**
   * Set callback for when we receive a remote stream
   */
  onStream(callback) {
    this.onStreamCallback = callback;
  }

  /**
   * Set callback for connection state changes
   */
  onConnectionStateChange(callback) {
    this.onConnectionStateCallback = callback;
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
