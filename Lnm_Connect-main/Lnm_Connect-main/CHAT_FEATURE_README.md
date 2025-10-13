# Real-Time Chat Feature Documentation

## Overview

A production-ready, LinkedIn-style one-on-one chat system with real-time messaging, typing indicators, message read receipts, and seamless profile integration.

## Features

### ✨ Core Features
- **Real-time messaging** using WebSocket (STOMP protocol)
- **One-on-one conversations** between any two users
- **Message persistence** in MongoDB
- **Profile integration** - Start chat from any user profile
- **Message status tracking** - SENT, DELIVERED, READ with visual indicators
- **Typing indicators** - See when the other person is typing
- **Unread message counts** - Badge notifications for new messages
- **Auto-scrolling** - Always see the latest messages
- **Responsive design** - Works on desktop and mobile
- **Connection resilience** - Auto-reconnect on network issues

### 🎨 UI Features
- Message bubbles with sender/receiver differentiation
- User avatars with fallback initials
- Date separators (Today, Yesterday, specific dates)
- Checkmark status indicators (✓ = sent, ✓✓ = delivered, ✓✓ blue = read)
- Search conversations
- Conversation list sorted by most recent
- Clean, modern interface

## Architecture

### Backend (Spring Boot)
```
backend/src/main/java/com/miniproject/backend/
├── config/
│   ├── WebSocketConfig.java          # WebSocket configuration
│   └── SecurityConfig.java           # CORS and security
├── model/
│   ├── ChatRoom.java                 # Chat room entity
│   ├── Message.java                  # Message entity
│   └── TypingIndicator.java          # Typing status
├── dto/
│   ├── MessageDTO.java               # Message data transfer
│   ├── ChatConversationDTO.java      # Conversation list item
│   └── SendMessageRequest.java       # Send message payload
├── repository/
│   ├── ChatRoomRepository.java       # Chat room queries
│   └── MessageRepository.java        # Message queries
├── service/
│   └── ChatService.java              # Business logic
└── controller/
    └── ChatController.java           # REST + WebSocket endpoints
```

### Frontend (React)
```
frontend/src/
├── components/
│   ├── ChatList.jsx                  # Conversation list sidebar
│   ├── ChatWindow.jsx                # Main chat interface
│   └── MessageButton.jsx             # Profile message button
├── pages/
│   └── ChatPage.jsx                  # Main chat page
├── hooks/
│   └── useWebSocket.js               # WebSocket connection hook
└── services/
    └── chatService.js                # API calls
```

## API Endpoints

### REST Endpoints

#### Get User Conversations
```
GET /api/chats?userId={userId}
Returns: List<ChatConversationDTO>
```

#### Get/Create Chat Room
```
GET /api/chats/room?user1Id={user1Id}&user2Id={user2Id}
Returns: String (chatRoomId)
```

#### Get Messages
```
GET /api/chats/{chatRoomId}?userId={userId}
Returns: List<MessageDTO>
```

#### Send Message
```
POST /api/chats/send?senderId={senderId}
Body: { receiverId, content, attachmentUrl? }
Returns: MessageDTO
```

#### Mark as Read
```
PUT /api/chats/{chatRoomId}/read?userId={userId}
```

#### Mark as Delivered
```
PUT /api/chats/{chatRoomId}/delivered?userId={userId}
```

### WebSocket Endpoints

#### Connection
```
Connect to: ws://localhost:8080/ws
```

#### Subscribe to Messages
```
/topic/messages/{chatRoomId}
```

#### Subscribe to Typing Indicator
```
/topic/typing/{chatRoomId}
```

#### Send Typing Indicator
```
/app/chat.typing/{chatRoomId}
```

#### Join Chat Room
```
/app/chat.join/{chatRoomId}
```

## Installation & Setup

### Prerequisites
- Java 17+
- Maven 3.6+
- MongoDB 4.4+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
mvn clean install
```

3. Configure MongoDB connection in `application.properties`:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/mydatabase
server.port=8080
```

4. Run the application:
```bash
mvn spring-boot:run
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

### Database Setup

Create indexes in MongoDB:
```javascript
use mydatabase;

// Chat rooms indexes
db.chat_rooms.createIndex({ "user1Id": 1, "user2Id": 1 }, { unique: true });
db.chat_rooms.createIndex({ "user1Id": 1 });
db.chat_rooms.createIndex({ "user2Id": 1 });
db.chat_rooms.createIndex({ "lastMessageAt": -1 });

// Messages indexes
db.messages.createIndex({ "chatRoomId": 1 });
db.messages.createIndex({ "chatRoomId": 1, "timestamp": 1 });
db.messages.createIndex({ "chatRoomId": 1, "receiverId": 1, "status": 1 });
```

## Usage

### Starting a Chat from Profile

1. Add the MessageButton component to any profile page:
```jsx
import MessageButton from './components/MessageButton';

<MessageButton 
  targetUserId={user.id}
  targetUserName={user.name}
  targetUserPhotoUrl={user.photoUrl}
/>
```

2. User clicks "Message" button
3. Redirects to chat page with conversation opened
4. If chat exists, loads history; otherwise creates new room

### Using the Chat Page

```jsx
import ChatPage from './pages/ChatPage';

// In your router
<Route path="/chat" element={<ChatPage />} />
```

The chat page automatically:
- Loads all user's conversations
- Establishes WebSocket connection
- Handles real-time message delivery
- Manages typing indicators
- Updates message statuses

## Configuration

### WebSocket Configuration

Modify `WebSocketConfig.java` to customize:
- Message broker settings
- STOMP endpoint paths
- Allowed origins
- SockJS options

### Security Configuration

Update `SecurityConfig.java` for:
- CORS policies
- JWT authentication (when implemented)
- Request authorization rules

### Frontend Configuration

Update API URLs in:
- `src/services/chatService.js` - REST API base URL
- `src/hooks/useWebSocket.js` - WebSocket URL

## Message Flow

### Sending a Message
1. User types and clicks send
2. Frontend calls `POST /api/chats/send`
3. Backend creates message with status SENT
4. Backend publishes to WebSocket topic
5. Both users receive message via WebSocket
6. Frontend updates UI immediately

### Status Updates
1. **SENT**: Message created and saved
2. **DELIVERED**: Receiver's client receives via WebSocket
3. **READ**: Receiver opens the chat room

### Typing Indicator
1. User starts typing
2. Frontend sends typing indicator every keystroke
3. Backend broadcasts to chat room topic
4. Other user sees "typing..." indicator
5. Indicator clears after 2 seconds of inactivity

## Data Models

### Message
```javascript
{
  id: "msg123",
  chatRoomId: "chat456",
  senderId: "user1",
  receiverId: "user2",
  content: "Hello!",
  attachmentUrl: null,
  timestamp: "2025-10-13T14:30:00Z",
  status: "READ"
}
```

### ChatConversation
```javascript
{
  chatRoomId: "chat456",
  otherUserId: "user2",
  otherUserName: "Bob Smith",
  otherUserPhotoUrl: "https://...",
  lastMessage: "See you tomorrow!",
  lastMessageTime: "2025-10-13T14:30:00Z",
  unreadCount: 3,
  lastMessageStatus: "DELIVERED",
  isLastMessageFromMe: true
}
```

## Performance Optimization

### Backend
- Indexes on frequently queried fields
- Efficient MongoDB queries with projections
- Connection pooling for database
- Message pagination for large histories

### Frontend
- Virtual scrolling for long message lists
- Debounced typing indicators
- Optimistic UI updates
- Lazy loading of conversations

### WebSocket
- Heartbeat to maintain connections
- Automatic reconnection with exponential backoff
- Subscription cleanup on unmount
- Efficient message serialization

## Security Considerations

### Current Implementation
- CORS enabled for development
- Basic request validation
- MongoDB connection security

### Production Recommendations
1. **Implement JWT Authentication**
   - Add JWT filter to validate tokens
   - Extract user ID from token, not query params
   - Secure WebSocket connections with JWT

2. **Input Validation**
   - Sanitize message content
   - Validate file uploads
   - Rate limiting on message sending

3. **Database Security**
   - Use MongoDB authentication
   - Encrypt sensitive data
   - Regular backups

4. **WebSocket Security**
   - Authenticate WebSocket connections
   - Validate message origins
   - Implement message rate limiting

## Troubleshooting

### WebSocket won't connect
- Check backend is running on port 8080
- Verify CORS settings in SecurityConfig
- Check browser console for connection errors
- Ensure MongoDB is running

### Messages not appearing
- Verify WebSocket connection status (check console)
- Check if chat room ID is correct
- Inspect network tab for failed requests
- Check backend logs for exceptions

### Typing indicator not working
- Verify subscription to typing topic
- Check that sendTypingIndicator is called
- Ensure chatRoomId is correct
- Check WebSocket connection

### High latency
- Check network connection
- Verify database indexes
- Monitor server resources
- Consider using Redis for caching

## Future Enhancements

- [ ] File/image attachments
- [ ] Voice messages
- [ ] Video calling
- [ ] Group chats
- [ ] Message search
- [ ] Message deletion/editing
- [ ] Emoji reactions
- [ ] Push notifications
- [ ] Message encryption
- [ ] Read receipts toggle
- [ ] Offline message queueing
- [ ] Message forwarding
- [ ] Chatbot integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

This project is part of the LnmConnect application.

## Support

For issues or questions:
- Check the TESTING_GUIDE.md for common scenarios
- Review DATABASE_SCHEMA.md for data structure
- Open an issue on the repository
