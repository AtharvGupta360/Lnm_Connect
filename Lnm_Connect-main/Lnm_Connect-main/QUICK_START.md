# Quick Start Guide - Chat Feature

## 🚀 Get Started in 5 Minutes

### Step 1: Start MongoDB
```powershell
# If MongoDB is installed locally
mongod

# OR using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Populate Test Data
```powershell
# Navigate to project root
cd c:\Users\gupta\Downloads\LnmConnect\Lnm_Connect-main\Lnm_Connect-main

# Run MongoDB script
mongosh < populate_test_data.js
```

### Step 3: Start Backend
```powershell
# Open new terminal
cd backend
mvn spring-boot:run
```

Wait for: `Started BackendApplication in X seconds`

### Step 4: Install Frontend Dependencies
```powershell
# Open new terminal
cd frontend
npm install
```

### Step 5: Start Frontend
```powershell
npm run dev
```

### Step 6: Test the Chat Feature

#### Option A: Use Browser Console

1. Open browser to `http://localhost:5173/chat`

2. Open browser console (F12) and run:
```javascript
// Login as Alice
localStorage.setItem('userId', 'user1');
localStorage.setItem('userName', 'Alice Johnson');
```

3. Refresh the page

4. You should see conversations with Bob and Charlie!

#### Option B: Test Real-Time Messaging

1. Open **two browser windows** side by side

2. **Window 1 (Alice)**:
   - Open Console (F12)
   - Run:
     ```javascript
     localStorage.setItem('userId', 'user1');
     localStorage.setItem('userName', 'Alice Johnson');
     ```
   - Navigate to: `http://localhost:5173/chat`
   - Click on Bob's conversation

3. **Window 2 (Bob)**:
   - Open Console (F12)
   - Run:
     ```javascript
     localStorage.setItem('userId', 'user2');
     localStorage.setItem('userName', 'Bob Smith');
     ```
   - Navigate to: `http://localhost:5173/chat`
   - Click on Alice's conversation

4. Start chatting! Messages will appear instantly in both windows! 🎉

### Step 7: Test Profile Integration

Add the Message button to any profile page:

```jsx
import MessageButton from './components/MessageButton';

function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <MessageButton 
        targetUserId={user.id}
        targetUserName={user.name}
        targetUserPhotoUrl={user.photoUrl}
      />
    </div>
  );
}
```

## 🧪 Quick Tests

### Test 1: Send a Message
1. Select a conversation
2. Type "Hello!" and press Enter
3. Message appears immediately with checkmark ✓

### Test 2: Real-Time Delivery
1. Open two windows (Alice and Bob)
2. Alice sends message to Bob
3. Message appears in Bob's window instantly
4. Checkmark changes to ✓✓ (delivered)

### Test 3: Typing Indicator
1. Open two windows
2. Alice starts typing
3. Bob sees "Alice is typing..." indicator
4. Stops after 2 seconds of no typing

### Test 4: Read Receipts
1. Alice sends message to Bob (✓)
2. Bob opens the chat (✓✓ gray)
3. Bob views the message (✓✓ blue)

### Test 5: Unread Count
1. Bob sends 3 messages to Alice
2. Alice sees badge with "3" on conversation
3. Alice opens chat
4. Badge disappears

## 📱 Test on Mobile

1. Get your local IP address:
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

2. Update frontend WebSocket URL:
```javascript
// frontend/src/hooks/useWebSocket.js
const SOCKET_URL = 'http://192.168.1.100:8080/ws';

// frontend/src/services/chatService.js
const API_BASE_URL = 'http://192.168.1.100:8080/api';
```

3. Access from mobile: `http://192.168.1.100:5173/chat`

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill the process if needed
taskkill /PID <PID> /F

# Check MongoDB is running
mongosh --eval "db.version()"
```

### Frontend build errors
```powershell
# Clear node modules and reinstall
rm -r node_modules
rm package-lock.json
npm install
```

### WebSocket won't connect
- Check backend is running: `http://localhost:8080`
- Check browser console for errors
- Verify CORS settings in SecurityConfig.java
- Try restarting both backend and frontend

### No conversations showing
```powershell
# Verify test data was loaded
mongosh
> use mydatabase
> db.users.count()  # Should be 4
> db.chat_rooms.count()  # Should be 3
> db.messages.count()  # Should be multiple

# If empty, re-run:
> load('populate_test_data.js')
```

## 🎯 Quick API Tests

### Get Conversations
```powershell
curl http://localhost:8080/api/chats?userId=user1
```

### Get Messages
```powershell
curl "http://localhost:8080/api/chats/chat1?userId=user1"
```

### Send Message
```powershell
curl -X POST "http://localhost:8080/api/chats/send?senderId=user1" `
  -H "Content-Type: application/json" `
  -d '{"receiverId":"user2","content":"Test message!"}'
```

## 📊 Monitor in Real-Time

### Watch MongoDB Activity
```powershell
mongosh
> use mydatabase
> db.messages.watch()
# Keeps showing new messages as they're created
```

### Watch Backend Logs
Backend terminal shows:
- WebSocket connections
- Message sends
- Status updates

### Watch Frontend Console
Browser console shows:
- WebSocket events
- Message received
- Typing indicators

## 🎨 Customize

### Change Colors
```css
/* frontend/src/index.css */
/* Blue theme -> Green theme */
.bg-blue-500 { background: #10b981; }
.text-blue-500 { color: #10b981; }
```

### Change Port
```properties
# backend/src/main/resources/application.properties
server.port=9090
```

```javascript
// frontend/src/hooks/useWebSocket.js
const SOCKET_URL = 'http://localhost:9090/ws';
```

## ✅ Success Checklist

- [ ] MongoDB running on port 27017
- [ ] Test data loaded (4 users, 3 chats)
- [ ] Backend running on port 8080
- [ ] Frontend running on port 5173
- [ ] Can see conversations in chat list
- [ ] Can send and receive messages
- [ ] Typing indicator works
- [ ] Checkmarks show correct status
- [ ] Unread count badge appears
- [ ] Real-time updates work between two windows

## 🎉 You're Ready!

Your chat feature is now fully functional! 

Next steps:
- Read `CHAT_FEATURE_README.md` for detailed documentation
- Check `TESTING_GUIDE.md` for comprehensive test scenarios
- Review `DATABASE_SCHEMA.md` for data structure
- Integrate with your existing authentication system
- Add file upload functionality
- Implement push notifications

## 💡 Pro Tips

1. **Keep both windows open** while testing to see real-time magic
2. **Check browser console** for WebSocket connection status
3. **Use different browsers** (Chrome + Firefox) to simulate different users
4. **MongoDB Compass** is great for viewing data visually
5. **Postman** helps test APIs without frontend

## 🆘 Need Help?

1. Check error in browser console (F12)
2. Check backend terminal for exceptions
3. Verify MongoDB has data: `mongosh` → `use mydatabase` → `db.users.find()`
4. Review TESTING_GUIDE.md for specific scenarios
5. Check if firewall is blocking ports 8080/5173

Happy Chatting! 💬✨
