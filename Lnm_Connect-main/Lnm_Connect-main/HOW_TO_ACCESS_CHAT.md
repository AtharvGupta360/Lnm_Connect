# 🚀 How to Access the Chat Feature

## ✅ The chat feature has been integrated into your website!

### Quick Access

1. **Navigate to Messages**: 
   - Click on the **"Messages"** link in the top navigation bar
   - Or go directly to: `http://localhost:5173/chat`

2. **What You'll See**:
   - Left sidebar: All your conversations
   - Right panel: Chat window with the selected person
   - Message button (💬) in the navigation

---

## 🔧 Setup Steps (First Time Only)

### Step 1: Make Sure MongoDB is Running
```powershell
# Check if MongoDB is running
mongosh

# If not running, start it:
mongod
```

### Step 2: Load Test Data
```powershell
# In the project root directory, run:
mongosh < populate_test_data.js
```

This creates:
- 4 test users (Alice, Bob, Charlie, Diana)
- 3 existing conversations
- Sample messages

### Step 3: Start the Backend
```powershell
# In the 'java' terminal (or new terminal):
cd backend
mvn spring-boot:run
```

Wait for: `Started BackendApplication in X seconds`

### Step 4: Restart Frontend (if not running)
```powershell
# In the 'esbuild' terminal:
npm run dev
```

---

## 🧪 Test the Chat Feature

### Method 1: Use Test Users

1. Open your website: `http://localhost:5173`
2. **Logout** if you're currently logged in
3. Login with test credentials:
   - Email: `alice@lnmconnect.com` or `bob@lnmconnect.com`
   - Password: any password (for test users)
4. Click **"Messages"** in the navigation bar
5. You should see existing conversations!

### Method 2: Real-Time Test (Two Windows)

1. **Window 1**: Login as your current user
2. **Window 2**: Open in Incognito/Private mode, login as another user
3. Both navigate to **Messages**
4. Start chatting! Messages appear instantly! 🎉

---

## 🎯 Where is the Chat Feature Located?

### In Navigation Bar:
```
Home | My Profile | 💬 Messages | [Welcome, username!] [Logout]
                      ↑
                   Click here!
```

### Direct URL:
- `http://localhost:5173/chat`

---

## 💬 How to Use

### View Conversations:
- Left sidebar shows all your conversations
- Each shows: User name, last message, time, unread count

### Send Messages:
1. Click on a conversation
2. Type your message at the bottom
3. Press Enter or click Send button
4. Message appears instantly!

### Features:
- ✅ Real-time messaging
- ✅ Read receipts (✓ sent, ✓✓ delivered, ✓✓ read)
- ✅ Typing indicators ("user is typing...")
- ✅ Unread message badges
- ✅ Search conversations
- ✅ Auto-scroll to latest message

---

## 🔗 Message Button on Profiles

To add a message button on any profile page:

```jsx
import MessageButton from '../components/MessageButton';

<MessageButton 
  targetUserId={user.id}
  targetUserName={user.name}
  targetUserPhotoUrl={user.photoUrl}
/>
```

---

## ❓ Troubleshooting

### Can't See Messages Link?
- Make sure you're logged in
- Refresh the page (Ctrl+R)
- Check browser console for errors (F12)

### No Conversations Showing?
```powershell
# Verify test data was loaded:
mongosh
> use mydatabase
> db.users.find().count()  # Should show 4
> db.chat_rooms.find().count()  # Should show 3

# If 0, reload test data:
> exit
mongosh < populate_test_data.js
```

### Backend Not Running?
```powershell
# Check if backend is running:
curl http://localhost:8080/api/chats?userId=user1

# If error, start backend:
cd backend
mvn spring-boot:run
```

### WebSocket Not Connecting?
- Check browser console (F12) for errors
- Verify backend is running on port 8080
- Try hard refresh: Ctrl+Shift+R

---

## 🎉 You're All Set!

The chat feature is now **fully integrated** into your website:
- ✅ Navigation link added
- ✅ Route configured  
- ✅ Components integrated
- ✅ Real-time messaging ready

Just click **"Messages"** in the top navigation bar! 💬✨

---

## 📝 Next Steps

1. **Test it now**: Click Messages in navigation
2. **Add message buttons**: Add to profile pages
3. **Customize styling**: Match your theme
4. **Create real conversations**: Chat with real users

For detailed documentation, see:
- `QUICK_START.md` - Complete setup guide
- `TESTING_GUIDE.md` - Testing scenarios
- `CHAT_FEATURE_README.md` - Full documentation

**Happy Chatting! 💬**
