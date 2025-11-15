import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// WebSocket connection URL
const SOCKET_URL = 'http://localhost:8080/ws';

export const useWebSocket = (userId) => {
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const subscriptionsRef = useRef(new Map());

  useEffect(() => {
    if (!userId) return;

    // Create STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      onConnect: () => {
        console.log('WebSocket Connected');
        setConnected(true);
        
        // Subscribe to user's personal notification queue
        client.subscribe(`/user/${userId}/queue/notifications`, (message) => {
          const notification = JSON.parse(message.body);
          console.log('Received notification:', notification);
          setMessages((prev) => [...prev, notification]);
        });
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();
    setStompClient(client);

    // Cleanup on unmount
    return () => {
      if (client) {
        client.deactivate();
      }
    };
  }, [userId]);

  // Subscribe to a chat room
  const subscribeToChatRoom = useCallback((chatRoomId, callback) => {
    if (!stompClient || !connected) return;

    // Unsubscribe if already subscribed
    if (subscriptionsRef.current.has(chatRoomId)) {
      subscriptionsRef.current.get(chatRoomId).unsubscribe();
    }

    // Subscribe to chat room messages
    const subscription = stompClient.subscribe(
      `/topic/messages/${chatRoomId}`,
      (message) => {
        const msg = JSON.parse(message.body);
        callback(msg);
      }
    );

    subscriptionsRef.current.set(chatRoomId, subscription);

    // Notify that user joined the chat room
    stompClient.publish({
      destination: `/app/chat.join/${chatRoomId}`,
      body: userId,
    });
  }, [stompClient, connected, userId]);

  // Subscribe to typing indicator
  const subscribeToTyping = useCallback((chatRoomId, callback) => {
    if (!stompClient || !connected) return;

    const subscription = stompClient.subscribe(
      `/topic/typing/${chatRoomId}`,
      (message) => {
        const indicator = JSON.parse(message.body);
        callback(indicator);
      }
    );

    return () => subscription.unsubscribe();
  }, [stompClient, connected]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((chatRoomId, userName, isTyping) => {
    if (!stompClient || !connected) return;

    stompClient.publish({
      destination: `/app/chat.typing/${chatRoomId}`,
      body: JSON.stringify({
        chatRoomId,
        userId,
        userName,
        isTyping,
      }),
    });
  }, [stompClient, connected, userId]);

  // Unsubscribe from a chat room
  const unsubscribeFromChatRoom = useCallback((chatRoomId) => {
    if (subscriptionsRef.current.has(chatRoomId)) {
      subscriptionsRef.current.get(chatRoomId).unsubscribe();
      subscriptionsRef.current.delete(chatRoomId);
    }
  }, []);

  return {
    connected,
    subscribeToChatRoom,
    subscribeToTyping,
    sendTypingIndicator,
    unsubscribeFromChatRoom,
    messages,
  };
};
