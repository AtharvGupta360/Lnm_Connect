# Chat Feature Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LnmConnect Chat System                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   Browser Window 1   │         │   Browser Window 2   │
│     (User Alice)     │         │      (User Bob)      │
│                      │         │                      │
│  ┌────────────────┐  │         │  ┌────────────────┐  │
│  │   ChatPage     │  │         │  │   ChatPage     │  │
│  │                │  │         │  │                │  │
│  │ ┌────────────┐ │  │         │  │ ┌────────────┐ │  │
│  │ │ ChatList   │ │  │         │  │ │ ChatList   │ │  │
│  │ └────────────┘ │  │         │  │ └────────────┘ │  │
│  │ ┌────────────┐ │  │         │  │ ┌────────────┐ │  │
│  │ │ChatWindow  │ │  │         │  │ │ChatWindow  │ │  │
│  │ └────────────┘ │  │         │  │ └────────────┘ │  │
│  └────────────────┘  │         │  └────────────────┘  │
└──────────────────────┘         └──────────────────────┘
         │                                    │
         │ HTTP REST API                      │ HTTP REST API
         │ WebSocket (STOMP)                  │ WebSocket (STOMP)
         │                                    │
         └──────────────┬─────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │     Spring Boot Backend      │
         │         (Port 8080)          │
         │                              │
         │  ┌────────────────────────┐  │
         │  │   ChatController       │  │
         │  │  - REST Endpoints      │  │
         │  │  - WebSocket Handlers  │  │
         │  └───────────┬────────────┘  │
         │              │                │
         │  ┌───────────▼────────────┐  │
         │  │    ChatService         │  │
         │  │  - Business Logic      │  │
         │  │  - Message Routing     │  │
         │  │  - Status Management   │  │
         │  └───────────┬────────────┘  │
         │              │                │
         │  ┌───────────▼────────────┐  │
         │  │   Repositories         │  │
         │  │  - ChatRoomRepository  │  │
         │  │  - MessageRepository   │  │
         │  └───────────┬────────────┘  │
         └──────────────┼────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │         MongoDB              │
         │      (Port 27017)            │
         │                              │
         │  ┌────────────────────────┐  │
         │  │  users                 │  │
         │  │  - User profiles       │  │
         │  └────────────────────────┘  │
         │  ┌────────────────────────┐  │
         │  │  chat_rooms            │  │
         │  │  - 1-on-1 mappings     │  │
         │  └────────────────────────┘  │
         │  ┌────────────────────────┐  │
         │  │  messages              │  │
         │  │  - All chat messages   │  │
         │  └────────────────────────┘  │
         └──────────────────────────────┘
```

## Component Architecture

```
Frontend (React)
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                        App Component                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   React Router   │
                    └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
 ┌────────────┐      ┌──────────────┐      ┌─────────────┐
 │  Profile   │      │   ChatPage   │      │   Other     │
 │   Page     │      │              │      │   Pages     │
 │            │      │              │      │             │
 │┌──────────┐│      │┌────────────┐│      └─────────────┘
 ││ Message  ││      ││  ChatList  ││
 ││ Button   ││      │└────────────┘│
 │└──────────┘│      │┌────────────┐│
 └────────────┘      ││ChatWindow  ││
                     │└────────────┘│
                     └──────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │ useWebSocket │    │ chatService  │
            │    Hook      │    │     API      │
            └──────────────┘    └──────────────┘
                    │                   │
                    │    WebSocket      │    HTTP REST
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Backend API    │
                    └─────────────────┘
```

## Backend Architecture

```
Spring Boot Application
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                    @RestController Layer                     │
├─────────────────────────────────────────────────────────────┤
│                    ChatController                            │
│  ┌───────────────────┐    ┌────────────────────────────┐   │
│  │  REST Endpoints   │    │  WebSocket Endpoints       │   │
│  │  - GET /chats     │    │  - @MessageMapping         │   │
│  │  - POST /send     │    │  - /chat.typing            │   │
│  │  - PUT /read      │    │  - /chat.join              │   │
│  └───────────────────┘    └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     @Service Layer                           │
├─────────────────────────────────────────────────────────────┤
│                      ChatService                             │
│  - getOrCreateChatRoom()                                     │
│  - sendMessage()                                             │
│  - getUserConversations()                                    │
│  - getChatRoomMessages()                                     │
│  - markMessagesAsRead()                                      │
│  - markMessagesAsDelivered()                                 │
│                                                              │
│  Uses: SimpMessagingTemplate for WebSocket broadcasts       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 @Repository Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │ ChatRoomRepository   │  │  MessageRepository       │    │
│  │  - findByUsers()     │  │  - findByChatRoomId()    │    │
│  │  - findByUserId()    │  │  - countUnread()         │    │
│  └──────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Database                           │
└─────────────────────────────────────────────────────────────┘
```

## Message Flow Sequence

```
User A sends "Hello!" to User B
═══════════════════════════════════════════════════════════════

User A          Frontend A      Backend       MongoDB    Frontend B      User B
  │                 │               │             │           │            │
  │  Type & Send    │               │             │           │            │
  ├────────────────>│               │             │           │            │
  │                 │ POST /send    │             │           │            │
  │                 ├──────────────>│             │           │            │
  │                 │               │ Insert msg  │           │            │
  │                 │               ├────────────>│           │            │
  │                 │               │ Saved       │           │            │
  │                 │               │<────────────┤           │            │
  │                 │               │             │           │            │
  │                 │               │ Broadcast via WebSocket │            │
  │                 │               ├─────────────────────────>│           │
  │                 │<──────────────┤             │           │            │
  │  See message    │               │             │           │ Message    │
  │  immediately ✓  │               │             │           │ appears    │
  │<────────────────┤               │             │           ├───────────>│
  │                 │               │             │           │  See "Hello!" ✓✓
  │                 │               │             │           │<───────────┤
  │                 │               │             │           │            │
  │                 │               │ User B opens chat       │            │
  │                 │               │<────────────────────────┤            │
  │                 │               │ Update status: READ     │            │
  │                 │               ├────────────>│           │            │
  │                 │               │             │           │            │
  │                 │               │ Broadcast READ status   │            │
  │                 │<──────────────┤             │           │            │
  │  Checkmark      │               │             │           │            │
  │  turns blue ✓✓  │               │             │           │            │
  │<────────────────┤               │             │           │            │
```

## WebSocket Communication

```
WebSocket Architecture
═══════════════════════════════════════════════════════════════

                     ┌──────────────────────┐
                     │   STOMP Broker       │
                     │   (In-Memory)        │
                     └──────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────┐
│   /topic/    │    │   /topic/        │    │   /user/     │
│  messages/   │    │   typing/        │    │  {userId}/   │
│{chatRoomId}  │    │ {chatRoomId}     │    │   queue/     │
│              │    │                  │    │notifications │
│ ┌──────────┐ │    │ ┌──────────────┐│    │              │
│ │  User A  │ │    │ │   User A     ││    │ ┌──────────┐ │
│ │  User B  │ │    │ │   User B     ││    │ │  User A  │ │
│ └──────────┘ │    │ └──────────────┘│    │ └──────────┘ │
│              │    │                  │    │              │
│ Purpose:     │    │ Purpose:         │    │ Purpose:     │
│ Real-time    │    │ "typing..."      │    │ Personal     │
│ messages     │    │ indicators       │    │ notifications│
└──────────────┘    └──────────────────┘    └──────────────┘
```

## Data Model Relationships

```
Database Relationships
═══════════════════════════════════════════════════════════════

┌─────────────────────┐
│       users         │
│─────────────────────│
│ _id: String (PK)    │
│ name: String        │
│ email: String       │
│ photoUrl: String    │
│ ...                 │
└─────────────────────┘
          │
          │ 1
          │
          │ N
          ▼
┌─────────────────────┐
│    chat_rooms       │
│─────────────────────│
│ _id: String (PK)    │
│ user1Id: String (FK)│─────┐
│ user2Id: String (FK)│─────┤  References users._id
│ createdAt: DateTime │     │
│ lastMessageAt: DT   │     │
└─────────────────────┘     │
          │                 │
          │ 1               │
          │                 │
          │ N               │
          ▼                 │
┌─────────────────────┐     │
│     messages        │     │
│─────────────────────│     │
│ _id: String (PK)    │     │
│ chatRoomId: Str(FK) │─────┘  References chat_rooms._id
│ senderId: Str (FK)  │──────┐
│ receiverId: Str(FK) │──────┤ References users._id
│ content: String     │      │
│ timestamp: DateTime │      │
│ status: Enum        │      │
│   SENT/DELIV/READ   │      │
└─────────────────────┘      │
```

## Component Communication Flow

```
Component Interaction
═══════════════════════════════════════════════════════════════

                      ┌─────────────┐
                      │  ChatPage   │
                      └──────┬──────┘
                             │
                 ┌───────────┼───────────┐
                 │                       │
        Selected │                       │ Real-time
         Chat    │                       │ Connection
                 │                       │
                 ▼                       ▼
         ┌──────────────┐       ┌──────────────┐
         │  ChatList    │       │ useWebSocket │
         │              │       │    Hook      │
         │  - Search    │       │              │
         │  - Convs     │       │ - Connect    │
         │  - Unread    │       │ - Subscribe  │
         └──────────────┘       │ - Publish    │
                 │              └──────────────┘
                 │                       │
                 │                       │ Messages
                 │                       │ Typing
                 │                       │
                 └───────────┬───────────┘
                             │
                             ▼
                    ┌──────────────┐
                    │ ChatWindow   │
                    │              │
                    │ - Messages   │
                    │ - Input      │
                    │ - Status     │
                    └──────────────┘
```

## State Management Flow

```
Frontend State Flow
═══════════════════════════════════════════════════════════════

Initial Load
────────────
App Loads → ChatPage mounts → useWebSocket connects
    │
    ├─> ChatList fetches conversations via REST
    │       └─> Display conversation list
    │
    └─> Subscribe to WebSocket /user/{userId}/queue/notifications


User Selects Chat
─────────────────
Click conversation → Update selectedChat state
    │
    ├─> ChatWindow fetches messages via REST
    │       └─> Display message history
    │
    ├─> Subscribe to /topic/messages/{chatRoomId}
    │
    └─> Subscribe to /topic/typing/{chatRoomId}


Send Message
────────────
Type & Send → POST /api/chats/send
    │
    ├─> Optimistic UI update (show immediately)
    │
    ├─> Backend saves & broadcasts via WebSocket
    │
    └─> Both users receive via WebSocket
            └─> Update message list


Receive Message
───────────────
WebSocket event → Update messages state
    │
    ├─> If chat open: mark as READ
    │
    ├─> If chat closed: increment unread count
    │
    └─> Update conversation list (last message, time)


Typing Indicator
────────────────
User types → Debounced (2s) → Send /app/chat.typing
    │
    └─> Other user receives via /topic/typing
            └─> Show "typing..." indicator
                    └─> Auto-clear after 2s
```

## Security Architecture (JWT-Ready)

```
Authentication Flow (To Be Implemented)
═══════════════════════════════════════════════════════════════

┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. Login (email/password)
       │
       ▼
┌─────────────────────────┐
│   AuthController        │
│   POST /api/auth/login  │
└────────┬────────────────┘
         │ 2. Validate credentials
         │
         ▼
┌─────────────────────────┐
│   Generate JWT Token    │
│   - userId              │
│   - Expiry              │
└────────┬────────────────┘
         │ 3. Return token
         │
         ▼
┌─────────────┐
│   Client    │
│ Store token │
│in localStorage
└──────┬──────┘
       │ 4. All API requests
       │    Authorization: Bearer {token}
       │
       ▼
┌─────────────────────────┐
│   JWT Filter            │
│   - Validate token      │
│   - Extract userId      │
│   - Set SecurityContext │
└────────┬────────────────┘
         │ 5. Pass to controller
         │    with authenticated user
         │
         ▼
┌─────────────────────────┐
│   ChatController        │
│   Use authenticated     │
│   userId (no param)     │
└─────────────────────────┘
```

## Scaling Strategy

```
Production Scaling Architecture
═══════════════════════════════════════════════════════════════

                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  Spring Boot   │  │  Spring Boot   │  │  Spring Boot   │
│  Instance 1    │  │  Instance 2    │  │  Instance 3    │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│    Redis       │  │    MongoDB     │  │   RabbitMQ     │
│  (Cache)       │  │  (Database)    │  │  (Message      │
│                │  │                │  │   Broker)      │
│ - Sessions     │  │ - Persistent   │  │ - WebSocket    │
│ - Conversations│  │   Data         │  │   Scaling      │
└────────────────┘  └────────────────┘  └────────────────┘
```

---

## Notes

- All communication flows are **bidirectional** in real-time
- WebSocket connections are **persistent** and **auto-reconnecting**
- Message status updates happen **automatically** via WebSocket
- Frontend uses **optimistic UI updates** for instant feedback
- Backend uses **MongoDB indexes** for fast queries
- System supports **horizontal scaling** with message broker

---

This architecture ensures:
✅ Real-time communication
✅ Scalability
✅ Maintainability  
✅ Security-ready
✅ Performance optimization
✅ User experience excellence
