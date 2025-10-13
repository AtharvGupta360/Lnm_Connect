# Chat Feature Database Schema (MongoDB)

## Collections

### 1. users (existing collection)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  skills: [String],
  interests: [String],
  githubProfile: String,
  portfolio: String,
  bio: String,
  education: String,
  branchYear: String,
  contact: String,
  photoUrl: String
}
```

### 2. chat_rooms (new collection)
Stores one-on-one chat room relationships between users.

```javascript
{
  _id: ObjectId,
  user1Id: String,          // First user's ID
  user2Id: String,          // Second user's ID
  createdAt: DateTime,      // When the chat room was created
  lastMessageAt: DateTime   // Last message timestamp (for sorting)
}
```

**Indexes:**
- Compound index on `{ user1Id: 1, user2Id: 1 }` for fast lookups
- Index on `user1Id` for user's conversations
- Index on `user2Id` for user's conversations
- Index on `lastMessageAt` for sorting

**Constraints:**
- Unique constraint to prevent duplicate chat rooms between same users
- Query to find chat room: `{ $or: [{ user1Id: A, user2Id: B }, { user1Id: B, user2Id: A }] }`

### 3. messages (new collection)
Stores all chat messages.

```javascript
{
  _id: ObjectId,
  chatRoomId: String,       // Reference to chat_rooms._id
  senderId: String,         // User who sent the message
  receiverId: String,       // User who receives the message
  content: String,          // Message text content
  attachmentUrl: String,    // URL to file attachment (optional)
  timestamp: DateTime,      // When message was sent
  status: String           // SENT, DELIVERED, READ
}
```

**Indexes:**
- Index on `chatRoomId` for fetching messages in a conversation
- Compound index on `{ chatRoomId: 1, timestamp: 1 }` for chronological ordering
- Compound index on `{ chatRoomId: 1, receiverId: 1, status: 1 }` for unread count

**Status Flow:**
1. SENT - Message created and saved
2. DELIVERED - Receiver's client connected and received the message
3. READ - Receiver opened the chat and viewed the message

## Sample MongoDB Commands

### Create Collections with Indexes

```javascript
// Create chat_rooms collection with indexes
db.createCollection("chat_rooms");
db.chat_rooms.createIndex({ "user1Id": 1, "user2Id": 1 }, { unique: true });
db.chat_rooms.createIndex({ "user1Id": 1 });
db.chat_rooms.createIndex({ "user2Id": 1 });
db.chat_rooms.createIndex({ "lastMessageAt": -1 });

// Create messages collection with indexes
db.createCollection("messages");
db.messages.createIndex({ "chatRoomId": 1 });
db.messages.createIndex({ "chatRoomId": 1, "timestamp": 1 });
db.messages.createIndex({ "chatRoomId": 1, "receiverId": 1, "status": 1 });
```

### Insert Sample Data

```javascript
// Sample users
db.users.insertMany([
  {
    _id: "user1",
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "$2a$10$...", // bcrypt hashed
    bio: "Software Engineer at Tech Corp",
    photoUrl: "https://i.pravatar.cc/150?img=1",
    skills: ["JavaScript", "React", "Node.js"],
    interests: ["Web Development", "AI"]
  },
  {
    _id: "user2",
    name: "Bob Smith",
    email: "bob@example.com",
    password: "$2a$10$...",
    bio: "Full Stack Developer",
    photoUrl: "https://i.pravatar.cc/150?img=2",
    skills: ["Python", "Django", "PostgreSQL"],
    interests: ["Backend Development", "DevOps"]
  },
  {
    _id: "user3",
    name: "Charlie Davis",
    email: "charlie@example.com",
    password: "$2a$10$...",
    bio: "UI/UX Designer & Frontend Dev",
    photoUrl: "https://i.pravatar.cc/150?img=3",
    skills: ["Figma", "React", "CSS"],
    interests: ["Design", "Frontend"]
  }
]);

// Sample chat room
db.chat_rooms.insertOne({
  _id: "chat1",
  user1Id: "user1",
  user2Id: "user2",
  createdAt: new Date("2025-10-13T10:00:00Z"),
  lastMessageAt: new Date("2025-10-13T14:30:00Z")
});

// Sample messages
db.messages.insertMany([
  {
    _id: "msg1",
    chatRoomId: "chat1",
    senderId: "user1",
    receiverId: "user2",
    content: "Hey Bob! How's the project going?",
    timestamp: new Date("2025-10-13T10:15:00Z"),
    status: "READ"
  },
  {
    _id: "msg2",
    chatRoomId: "chat1",
    senderId: "user2",
    receiverId: "user1",
    content: "Hi Alice! Going great, just finished the API integration.",
    timestamp: new Date("2025-10-13T10:20:00Z"),
    status: "READ"
  },
  {
    _id: "msg3",
    chatRoomId: "chat1",
    senderId: "user1",
    receiverId: "user2",
    content: "Awesome! Can you share the documentation?",
    timestamp: new Date("2025-10-13T14:30:00Z"),
    status: "DELIVERED"
  }
]);
```

## Query Examples

### Get user's conversations
```javascript
db.chat_rooms.find({
  $or: [
    { user1Id: "user1" },
    { user2Id: "user1" }
  ]
}).sort({ lastMessageAt: -1 });
```

### Get messages in a chat room
```javascript
db.messages.find({ chatRoomId: "chat1" })
  .sort({ timestamp: 1 });
```

### Count unread messages
```javascript
db.messages.countDocuments({
  chatRoomId: "chat1",
  receiverId: "user1",
  status: { $ne: "READ" }
});
```

### Get last message in chat room
```javascript
db.messages.findOne({ chatRoomId: "chat1" })
  .sort({ timestamp: -1 });
```

### Mark messages as read
```javascript
db.messages.updateMany(
  {
    chatRoomId: "chat1",
    receiverId: "user1",
    status: { $ne: "READ" }
  },
  {
    $set: { status: "READ" }
  }
);
```

## Data Migration Notes

If you need to migrate from PostgreSQL to MongoDB or vice versa:

### PostgreSQL Equivalent Schema

```sql
-- chat_rooms table
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id VARCHAR(255) NOT NULL,
    user2_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_chat_rooms_user1 ON chat_rooms(user1_id);
CREATE INDEX idx_chat_rooms_user2 ON chat_rooms(user2_id);
CREATE INDEX idx_chat_rooms_last_message ON chat_rooms(last_message_at DESC);

-- messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id),
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachment_url VARCHAR(500),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'SENT'
);

CREATE INDEX idx_messages_chat_room ON messages(chat_room_id, timestamp);
CREATE INDEX idx_messages_unread ON messages(chat_room_id, receiver_id, status);
```

## Performance Considerations

1. **Pagination**: For large message histories, implement cursor-based pagination:
   ```javascript
   db.messages.find({ 
     chatRoomId: "chat1",
     timestamp: { $lt: lastSeenTimestamp }
   })
   .sort({ timestamp: -1 })
   .limit(50);
   ```

2. **Archiving**: Archive old messages (> 1 year) to separate collection
3. **Caching**: Cache recent conversations in Redis for faster load times
4. **Real-time**: Use MongoDB Change Streams for real-time updates (alternative to WebSocket for some use cases)
