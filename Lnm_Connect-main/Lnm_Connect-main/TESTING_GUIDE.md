# Chat Feature Testing Guide

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies (if needed)
mvn clean install

# Start the Spring Boot application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 2. MongoDB Setup

Make sure MongoDB is running on `mongodb://localhost:27017/mydatabase`

```bash
# Start MongoDB (if using local installation)
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Test Scenarios

### Scenario 1: First-Time Chat Initiation

**Objective**: Test creating a new chat between two users who have never messaged before.

**Steps**:
1. Open browser and go to `http://localhost:5173`
2. Set up two users in localStorage:
   ```javascript
   // In Browser Console (Tab 1 - User Alice)
   localStorage.setItem('userId', 'user1');
   localStorage.setItem('userName', 'Alice Johnson');
   ```
3. Navigate to a user profile page (Bob's profile)
4. Click the "Message" button
5. You should be redirected to the chat page
6. A new chat room should be created
7. Type a message: "Hi Bob! Let's connect on the project."
8. Press Send

**Expected Results**:
- New chat room created in database
- Message appears in chat window immediately
- Message status shows as "SENT" (single checkmark)
- Message stored in MongoDB with correct timestamp

### Scenario 2: Real-Time Messaging Between Two Users

**Objective**: Test WebSocket real-time communication.

**Steps**:
1. Open two browser windows side by side
2. Window 1 (Alice):
   ```javascript
   localStorage.setItem('userId', 'user1');
   localStorage.setItem('userName', 'Alice Johnson');
   ```
   Navigate to `/chat`

3. Window 2 (Bob):
   ```javascript
   localStorage.setItem('userId', 'user2');
   localStorage.setItem('userName', 'Bob Smith');
   ```
   Navigate to `/chat`

4. In Alice's window: Find Bob's conversation and click on it
5. In Bob's window: The conversation with Alice should appear
6. Alice sends: "Are you available for a call?"
7. Observe Bob's window - message should appear immediately
8. Bob replies: "Yes, let me just finish this task."
9. Observe Alice's window - reply appears in real-time

**Expected Results**:
- Messages appear instantly in both windows
- No page refresh required
- Message status updates: SENT → DELIVERED → READ
- Checkmarks change color when message is read
- Timestamps show correctly
- Unread count badge updates automatically

### Scenario 3: Typing Indicator

**Objective**: Test the "user is typing..." feature.

**Steps**:
1. With two browser windows open (Alice and Bob)
2. Both users have the same chat room open
3. Alice starts typing a message
4. In Bob's window, "Alice is typing..." should appear below her name
5. Alice stops typing for 2 seconds
6. Typing indicator disappears
7. Alice sends the message
8. Message appears for both users

**Expected Results**:
- Typing indicator appears within 500ms of typing start
- Indicator disappears 2 seconds after typing stops
- Indicator works bidirectionally
- Indicator clears when message is sent

### Scenario 4: Message Status Updates

**Objective**: Test the three-tier message status system (SENT, DELIVERED, READ).

**Steps**:
1. Alice's window: Open chat with Bob
2. Bob's window: Stay on the chat list (don't open Alice's chat)
3. Alice sends: "Hey, check out this link!"
4. Observe status in Alice's window: Single checkmark (✓) - SENT
5. Bob's window: Click on Alice's chat to open it
6. Observe Alice's window: Double gray checkmark (✓✓) - DELIVERED
7. Bob stays on the chat window for a moment
8. Observe Alice's window: Double blue checkmark (✓✓) - READ

**Expected Results**:
- Status changes are automatic
- Visual indicators update in real-time
- Colors: Single gray = SENT, Double gray = DELIVERED, Double blue = READ
- Status persists after page reload

### Scenario 5: Unread Message Count

**Objective**: Test the unread message badge in chat list.

**Steps**:
1. Alice and Bob have an existing chat
2. Bob's window: Navigate away from chat page
3. Alice sends 3 messages to Bob
4. Bob returns to chat page
5. Bob should see a blue badge with "3" on Alice's conversation
6. Bob clicks on Alice's chat
7. Badge should disappear
8. Messages should now show as READ

**Expected Results**:
- Unread count shows correct number
- Badge is blue and prominent
- Count updates in real-time as messages arrive
- Badge disappears when chat is opened
- Previously unread messages marked as READ

### Scenario 6: Conversation List Ordering

**Objective**: Test that conversations are sorted by most recent message.

**Steps**:
1. Alice has conversations with Bob, Charlie, and Diana
2. Last message times:
   - Bob: 2 hours ago
   - Charlie: 1 day ago
   - Diana: 5 minutes ago
3. Navigate to chat page
4. Observe order: Diana (top), Bob, Charlie (bottom)
5. Send a new message to Charlie
6. Charlie's conversation should jump to the top

**Expected Results**:
- Conversations sorted by lastMessageAt timestamp
- Most recent on top
- Updates automatically when new message arrives
- Works for both sent and received messages

### Scenario 7: Profile Integration

**Objective**: Test starting a chat from a user profile.

**Steps**:
1. Navigate to Bob's profile page
2. Click "Message" button
3. Should redirect to chat page with Bob's chat opened
4. If chat exists, load previous messages
5. If new chat, show empty conversation
6. Send a message
7. Return to chat list
8. New conversation should appear

**Expected Results**:
- Smooth navigation from profile to chat
- Chat opens automatically
- Previous messages load if conversation exists
- New chat creates room on first message
- Can navigate back to profile

### Scenario 8: Connection Loss and Reconnection

**Objective**: Test WebSocket reconnection handling.

**Steps**:
1. Alice has chat open with Bob
2. Stop the backend server
3. Alice should see "Connecting to chat server..." indicator
4. Alice tries to send a message - should show error
5. Restart the backend server
6. Connection indicator should disappear
7. Alice sends a message - should work

**Expected Results**:
- Clear visual indicator when disconnected
- Automatic reconnection attempts
- Message sending disabled when disconnected
- Seamless reconnection when server is back
- No data loss

### Scenario 9: Multiple Conversations

**Objective**: Test handling multiple active chats.

**Steps**:
1. Alice opens chats with Bob, Charlie, and Diana
2. Send messages to each of them
3. Receive replies from all three
4. Switch between conversations
5. Each should maintain its own state
6. Send messages to different people
7. Check all messages are in correct chat rooms

**Expected Results**:
- Each conversation is independent
- Messages don't mix between chats
- Switching conversations is instant
- WebSocket subscriptions update correctly
- Unread counts are accurate per conversation

### Scenario 10: Message History Loading

**Objective**: Test loading and displaying message history.

**Steps**:
1. Create a chat with 50+ messages (can use script)
2. Open the chat
3. Scroll to see all messages
4. Messages should be grouped by date
5. Close and reopen the chat
6. All messages should still be there
7. Date separators should show correctly

**Expected Results**:
- All messages load from database
- Chronological order maintained
- Date separators: "Today", "Yesterday", specific dates
- Scroll position starts at bottom (latest message)
- Auto-scroll when new message arrives

## API Testing with Postman/cURL

### Get User Conversations
```bash
curl -X GET "http://localhost:8080/api/chats?userId=user1"
```

### Get Chat Room ID
```bash
curl -X GET "http://localhost:8080/api/chats/room?user1Id=user1&user2Id=user2"
```

### Get Messages in Chat Room
```bash
curl -X GET "http://localhost:8080/api/chats/chat1?userId=user1"
```

### Send Message
```bash
curl -X POST "http://localhost:8080/api/chats/send?senderId=user1" \
  -H "Content-Type: application/json" \
  -d '{
    "receiverId": "user2",
    "content": "Hello from API!"
  }'
```

### Mark as Read
```bash
curl -X PUT "http://localhost:8080/api/chats/chat1/read?userId=user1"
```

## WebSocket Testing with Browser Console

```javascript
// Connect to WebSocket
const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
  console.log('Connected: ' + frame);
  
  // Subscribe to messages
  stompClient.subscribe('/topic/messages/chat1', function(message) {
    console.log('Received:', JSON.parse(message.body));
  });
  
  // Send typing indicator
  stompClient.send('/app/chat.typing/chat1', {}, JSON.stringify({
    chatRoomId: 'chat1',
    userId: 'user1',
    userName: 'Alice',
    isTyping: true
  }));
});
```

## Performance Testing

### Load Test: Multiple Concurrent Users
- Use JMeter or Artillery to simulate 100+ concurrent users
- Each user sends 10 messages per minute
- Monitor server CPU, memory, and response times
- WebSocket connections should remain stable

### Database Performance
```javascript
// Check query performance
db.messages.find({ chatRoomId: "chat1" }).explain("executionStats");

// Verify indexes are being used
db.chat_rooms.getIndexes();
db.messages.getIndexes();
```

## Common Issues and Troubleshooting

### Issue: WebSocket not connecting
- Check if backend is running on port 8080
- Verify CORS settings in SecurityConfig
- Check browser console for errors
- Ensure MongoDB is running

### Issue: Messages not appearing
- Check WebSocket connection status
- Verify chat room ID is correct
- Check browser console for JavaScript errors
- Verify backend logs for exceptions

### Issue: Typing indicator not working
- Check WebSocket subscription to `/topic/typing/{chatRoomId}`
- Verify sendTypingIndicator is being called
- Check timing (indicator clears after 2 seconds)

### Issue: Unread count incorrect
- Verify markAsRead is being called when opening chat
- Check database for message status
- Refresh page to see if count updates

## Sample Test Data Script

```javascript
// Run in MongoDB shell to create test data
use mydatabase;

// Create test users
db.users.insertMany([
  { _id: "user1", name: "Alice Johnson", email: "alice@test.com", photoUrl: "https://i.pravatar.cc/150?img=1" },
  { _id: "user2", name: "Bob Smith", email: "bob@test.com", photoUrl: "https://i.pravatar.cc/150?img=2" },
  { _id: "user3", name: "Charlie Davis", email: "charlie@test.com", photoUrl: "https://i.pravatar.cc/150?img=3" }
]);

// Create chat rooms
db.chat_rooms.insertMany([
  { _id: "chat1", user1Id: "user1", user2Id: "user2", createdAt: new Date(), lastMessageAt: new Date() },
  { _id: "chat2", user1Id: "user1", user2Id: "user3", createdAt: new Date(), lastMessageAt: new Date() }
]);

// Create test messages
for(let i = 1; i <= 20; i++) {
  db.messages.insertOne({
    chatRoomId: "chat1",
    senderId: i % 2 === 0 ? "user1" : "user2",
    receiverId: i % 2 === 0 ? "user2" : "user1",
    content: `Test message ${i}`,
    timestamp: new Date(Date.now() - (20 - i) * 60000),
    status: "READ"
  });
}
```

## Success Criteria

✅ All messages delivered in < 100ms via WebSocket  
✅ UI responds to user actions in < 50ms  
✅ No data loss during network interruptions  
✅ Typing indicators work smoothly  
✅ Message statuses update correctly  
✅ Unread counts are accurate  
✅ Conversations sort by most recent  
✅ WebSocket reconnects automatically  
✅ Database queries use indexes efficiently  
✅ Frontend handles 100+ conversations smoothly
