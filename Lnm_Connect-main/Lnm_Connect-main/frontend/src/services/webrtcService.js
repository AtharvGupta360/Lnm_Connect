class WebRTCService {
  constructor() {
    this.peers = new Map(); // Map of userId -> RTCPeerConnection
    this.pendingCandidates = new Map(); // Map of userId -> Array of ICE candidates
    this.initiatedConnections = new Set(); // Track users we've already tried to connect with
    this.processingUsers = new Set(); // Track users currently being processed
    this.connectionTimers = new Map(); // Track connection timeout timers
    this.answerWaitTimers = new Map(); // Timers waiting for remote answer
    this.offerRetryCounts = new Map(); // Number of offer retries per user
    this.candidateTypes = new Map(); // Map of userId -> Set of candidate types seen ('host','srflx','relay')
    this.localStream = null;
    this.stompClient = null;
    this.channelId = null;
    this.currentUserId = null;
    this.subscriptions = []; // Track WebSocket subscriptions for cleanup
    this.onPeerJoinedCallback = null;
    this.onPeerLeftCallback = null;
    this.onStreamCallback = null;
    this.onConnectionStateCallback = null;
    this.forceTurnOnly = false; // When true, use TURN-only (relay) for ICE
    
    // Base ICE servers list (will be composed into config dynamically)
    const baseServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
      // Multiple free TURN servers for better reliability
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
      },
      // Note: viagenie is deprecated/unreliable now, keep for compatibility but avoid if possible
      {
        urls: 'turn:numb.viagenie.ca',
        username: 'webrtc@live.com',
        credential: 'muazkh'
      }
    ];

    // Allow override via Vite env (VITE_TURN_URLS comma-separated, VITE_TURN_USERNAME, VITE_TURN_CREDENTIAL)
    try {
      const env = import.meta?.env || {};
      const urlsEnv = env.VITE_TURN_URLS;
      const userEnv = env.VITE_TURN_USERNAME;
      const credEnv = env.VITE_TURN_CREDENTIAL;
      if (urlsEnv && userEnv && credEnv) {
        const urls = String(urlsEnv).split(',').map(u => u.trim()).filter(Boolean);
        const customTurn = urls.map(u => ({ urls: u, username: userEnv, credential: credEnv }));
        console.log('🧊 Using TURN servers from env:', urls);
        this.allIceServers = [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
          ...customTurn,
        ];
      } else {
        this.allIceServers = baseServers;
      }
    } catch (e) {
      console.warn('Env TURN configuration not applied:', e);
      this.allIceServers = baseServers;
    }
  }

  // Configure TURN-only mode (relay candidates only)
  setTurnOnly(enabled) {
    this.forceTurnOnly = !!enabled;
    console.log(`🎛️ TURN-only mode ${this.forceTurnOnly ? 'ENABLED' : 'DISABLED'}`);
  }

  // Compose RTCConfiguration based on current flags
  getRtcConfig() {
    const turnServers = this.allIceServers.filter(s => String(s.urls).startsWith('turn:'));
    const stunServers = this.allIceServers.filter(s => String(s.urls).startsWith('stun:'));
    const iceServers = this.forceTurnOnly ? turnServers : [...stunServers, ...turnServers];
    const cfg = {
      iceServers,
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    };
    // In TURN-only mode force relay candidates
    cfg.iceTransportPolicy = this.forceTurnOnly ? 'relay' : 'all';
    return cfg;
  }

  /**
   * Initialize WebRTC service
   */
  async initialize(stompClient, channelId, currentUserId) {
    console.log(`🔧 Initializing WebRTC for user ${currentUserId} in channel ${channelId}`);
    
    // If already initialized with different user, clean up first
    if (this.currentUserId && this.currentUserId !== currentUserId) {
      console.log(`⚠️ User changed from ${this.currentUserId} to ${currentUserId}, cleaning up old connections`);
      this.leave();
    }
    
    this.stompClient = stompClient;
    this.channelId = channelId;
    this.currentUserId = currentUserId;
    
    // Subscribe to WebRTC signaling messages and wait for them to be ready
    await this.subscribeToSignaling();
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
  async subscribeToSignaling() {
    console.log(`📡 Subscribing to WebRTC signaling for channel ${this.channelId}`);
    console.log(`📡 Current user subscribing: ${this.currentUserId}`);
    
    // Track subscriptions
    const subscriptions = [];
    
    // Subscribe to offers
    const offerSub = this.stompClient.subscribe(`/user/queue/voice-channel/offer`, (message) => {
      console.log(`📨 RAW offer message received by ${this.currentUserId}:`, message);
      const data = JSON.parse(message.body);
      console.log(`📥 Parsed offer data - from: ${data.from}, to: ${data.to}:`, data);
      this.handleOffer(data);
    });
    subscriptions.push(offerSub);
    console.log(`✅ Subscribed to offers for user ${this.currentUserId}`);

    // Subscribe to answers
    const answerSub = this.stompClient.subscribe(`/user/queue/voice-channel/answer`, (message) => {
      console.log(`📨 RAW answer message received by ${this.currentUserId}:`, message);
      const data = JSON.parse(message.body);
      console.log(`📥 Parsed answer data - from: ${data.from}, to: ${data.to}:`, data);
      this.handleAnswer(data);
    });
    subscriptions.push(answerSub);
    console.log(`✅ Subscribed to answers for user ${this.currentUserId}`);

    // Subscribe to ICE candidates
    const iceSub = this.stompClient.subscribe(`/user/queue/voice-channel/ice-candidate`, (message) => {
      const data = JSON.parse(message.body);
      this.handleIceCandidate(data);
    });
    subscriptions.push(iceSub);
    console.log(`✅ Subscribed to ICE candidates for user ${this.currentUserId}`);

    // Subscribe to user joined notifications
    const joinedSub = this.stompClient.subscribe(`/topic/voice-channel/${this.channelId}/user-joined`, (message) => {
      const data = JSON.parse(message.body);
      console.log(`📢 User joined notification received - userId: ${data.userId}, currentUser: ${this.currentUserId}`);
      if (data.userId !== this.currentUserId) {
        this.handleUserJoined(data.userId);
      }
    });
    subscriptions.push(joinedSub);
    console.log(`✅ Subscribed to user-joined for channel ${this.channelId}`);

    // Subscribe to user left notifications
    const leftSub = this.stompClient.subscribe(`/topic/voice-channel/${this.channelId}/user-left`, (message) => {
      const data = JSON.parse(message.body);
      if (data.userId !== this.currentUserId) {
        this.handleUserLeft(data.userId);
      }
    });
    subscriptions.push(leftSub);
    console.log(`✅ Subscribed to user-left for channel ${this.channelId}`);
    
    // Store subscriptions for cleanup
    this.subscriptions = subscriptions;
    
    // Wait for subscriptions to be fully active
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`✅ All subscriptions ready for user ${this.currentUserId}`);
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
      // Create RTCPeerConnection with current ICE configuration
      const rtcConfig = this.getRtcConfig();
      console.log('🧊 Using RTCConfiguration:', rtcConfig);
      const peerConnection = new RTCPeerConnection(rtcConfig);
      
      console.log(`Peer connection created for ${userId}, adding local tracks...`);
      
      // Add local stream tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream);
        console.log(`Added local ${track.kind} track for ${userId}:`, track.label);
      });

      // Reset candidate type tracking for this peer
      this.candidateTypes.set(userId, new Set());

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
          // Track type for diagnostics
          const set = this.candidateTypes.get(userId) || new Set();
          if (candidateStr.includes('host')) set.add('host');
          if (candidateStr.includes('srflx')) set.add('srflx');
          if (candidateStr.includes('relay')) set.add('relay');
          this.candidateTypes.set(userId, set);
          this.sendIceCandidate(userId, event.candidate);
        } else {
          console.log(`✅ ICE gathering complete for ${userId}`);
          // Diagnostics: warn if TURN-only but no relay candidates gathered
          if (this.forceTurnOnly) {
            const set = this.candidateTypes.get(userId) || new Set();
            if (!set.has('relay')) {
              console.warn(`⚠️ TURN-only is enabled but no relay candidates were gathered for ${userId}.`);
              console.warn(`   This indicates the configured TURN servers are unreachable or blocked.`);
              console.warn(`   Configure valid TURN credentials via VITE_TURN_URLS/VITE_TURN_USERNAME/VITE_TURN_CREDENTIAL.`);
            }
          }
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
        
        // Clear any existing timeout
        if (this.connectionTimers.has(userId)) {
          clearTimeout(this.connectionTimers.get(userId));
          this.connectionTimers.delete(userId);
        }
        
        if (state === 'checking') {
          // Set a 15-second timeout for ICE checking
          const timer = setTimeout(() => {
            const currentState = peerConnection.iceConnectionState;
            if (currentState === 'checking') {
              console.warn(`⏰ Connection timeout with ${userId} - still in 'checking' after 15s`);
              console.warn(`This suggests ICE candidates are not working. Cleaning up...`);
              peerConnection.close();
              this.peers.delete(userId);
              this.initiatedConnections.delete(userId);
              this.connectionTimers.delete(userId);
              
              if (this.onConnectionStateCallback) {
                this.onConnectionStateCallback(userId, 'failed');
              }
            }
          }, 15000);
          this.connectionTimers.set(userId, timer);
        }
        
        if (state === 'failed') {
          console.error(`❌ ICE connection failed with ${userId} - this usually means:`);
          console.error(`   - No valid ICE candidate pairs found`);
          console.error(`   - Firewall blocking connection`);
          console.error(`   - Network connectivity issues`);
          if (this.onConnectionStateCallback) {
            this.onConnectionStateCallback(userId, 'failed');
          }
        } else if (state === 'connected' || state === 'completed') {
          console.log(`🎉 Successfully established ICE connection with ${userId}`);
          // Some browsers may not update RTCPeerConnection.connectionState promptly.
          // Reflect connectivity in UI based on ICE success.
          if (this.onConnectionStateCallback) {
            this.onConnectionStateCallback(userId, 'connected');
          }
        } else if (state === 'disconnected') {
          if (this.onConnectionStateCallback) {
            this.onConnectionStateCallback(userId, 'disconnected');
          }
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

        // Start answer wait timer with limited retries
        const startAnswerWait = (attempt) => {
          const waitMs = attempt === 1 ? 4000 : attempt === 2 ? 6000 : 8000;
          const timer = setTimeout(async () => {
            const pc = this.peers.get(userId);
            if (!pc) {
              console.warn(`⏳ Offer wait: peer ${userId} no longer exists, stopping retries`);
              this.answerWaitTimers.delete(userId);
              this.offerRetryCounts.delete(userId);
              return;
            }

            if (pc.signalingState === 'have-local-offer') {
              const retries = this.offerRetryCounts.get(userId) || 0;
              if (retries >= 3) {
                console.error(`❌ No answer from ${userId} after ${retries} retries. Giving up.`);
                this.answerWaitTimers.delete(userId);
                return;
              }

              try {
                const nextAttempt = retries + 1;
                this.offerRetryCounts.set(userId, nextAttempt);
                console.warn(`🔁 No answer yet from ${userId}. Resending offer (attempt ${nextAttempt}) with ICE restart`);
                const newOffer = await pc.createOffer({
                  offerToReceiveAudio: true,
                  offerToReceiveVideo: false,
                  iceRestart: true,
                });
                await pc.setLocalDescription(newOffer);
                this.sendOffer(userId, newOffer);
                // Schedule next wait
                startAnswerWait(nextAttempt + 1);
              } catch (e) {
                console.error(`❌ Error during offer retry to ${userId}:`, e);
                this.answerWaitTimers.delete(userId);
              }
            } else {
              // We likely received an answer and moved to stable
              this.answerWaitTimers.delete(userId);
              this.offerRetryCounts.delete(userId);
            }
          }, waitMs);

          // Track timer
          this.answerWaitTimers.set(userId, timer);
        };

        // Initialize retries tracking
        this.offerRetryCounts.set(userId, 0);
        startAnswerWait(1);
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
    console.log(`📤 Attempting to send offer from ${this.currentUserId} to ${toUserId}`);
    if (this.stompClient && this.stompClient.connected) {
      const message = {
        from: this.currentUserId,
        to: toUserId,
        channelId: this.channelId,
        offer: offer,
      };
      console.log(`📤 Publishing offer message:`, message);
      this.stompClient.publish({
        destination: `/app/voice-channel/${this.channelId}/offer`,
        body: JSON.stringify(message),
      });
      console.log(`✅ Offer sent successfully to ${toUserId}`);
    } else {
      console.error(`❌ Cannot send offer - STOMP not connected`);
    }
  }

  /**
   * Send WebRTC answer via WebSocket
   */
  sendAnswer(toUserId, answer) {
    console.log(`📤 Attempting to send answer from ${this.currentUserId} to ${toUserId}`);
    if (this.stompClient && this.stompClient.connected) {
      const message = {
        from: this.currentUserId,
        to: toUserId,
        channelId: this.channelId,
        answer: answer,
      };
      console.log(`📤 Publishing answer message:`, message);
      this.stompClient.publish({
        destination: `/app/voice-channel/${this.channelId}/answer`,
        body: JSON.stringify(message),
      });
      console.log(`✅ Answer sent successfully to ${toUserId}`);
    } else {
      console.error(`❌ Cannot send answer - STOMP not connected`);
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
        // Clear any waiting/retry timers for this peer now that we have the answer
        if (this.answerWaitTimers.has(from)) {
          clearTimeout(this.answerWaitTimers.get(from));
          this.answerWaitTimers.delete(from);
        }
        this.offerRetryCounts.delete(from);
        
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
          // Check if we already have a peer connection
          const existingPeer = this.peers.get(userId);
          
          if (existingPeer) {
            const connectionState = existingPeer.connectionState;
            const iceState = existingPeer.iceConnectionState;
            
            console.log(`🔍 Existing peer ${userId}: connectionState=${connectionState}, iceState=${iceState}`);
            
            // If connection is working or in progress, skip
            if (connectionState === 'connected' || 
                (connectionState === 'connecting' && iceState !== 'failed')) {
              console.log(`⏭️ Skipping ${userId} - already ${connectionState}/${iceState}`);
              continue;
            }
            
            // If connection is stuck or failed, clean up
            if (connectionState === 'failed' || connectionState === 'closed' ||
                iceState === 'failed' || iceState === 'disconnected') {
              console.log(`🔄 Cleaning up failed connection with ${userId} (${connectionState}/${iceState})`);
              existingPeer.close();
              this.peers.delete(userId);
              this.initiatedConnections.delete(userId);
            } else if (connectionState === 'connecting' && iceState === 'checking') {
              // Still connecting, give it more time
              console.log(`⏳ Connection with ${userId} still in progress, skipping for now`);
              continue;
            }
          }
          
          // Check if we have a peer connection now (should be cleaned up if it was bad)
          if (!this.peers.has(userId)) {
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
    
    // Clear all connection timers
    this.connectionTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.connectionTimers.clear();

    // Clear all answer wait timers
    this.answerWaitTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.answerWaitTimers.clear();
    this.offerRetryCounts.clear();
    
    // Unsubscribe from all subscriptions
    if (this.subscriptions) {
      this.subscriptions.forEach(sub => {
        try {
          sub.unsubscribe();
        } catch (e) {
          console.warn('Error unsubscribing:', e);
        }
      });
      this.subscriptions = [];
    }
    
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
