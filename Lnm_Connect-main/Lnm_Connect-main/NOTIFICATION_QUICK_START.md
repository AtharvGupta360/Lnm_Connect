# 🚀 NOTIFICATION SYSTEM - QUICK START GUIDE

## ⚡ Start the Application

### 1. Start Backend
```bash
cd backend
mvn spring-boot:run
```
✅ Backend running on: http://localhost:8080

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running on: http://localhost:5173

---

## 🧪 Test Notifications (5-Minute Walkthrough)

### **Step 1: Create Two User Accounts**
1. Go to http://localhost:5173
2. Sign up as "Alice" (alice@test.com)
3. Logout
4. Sign up as "Bob" (bob@test.com)

### **Step 2: Test @Mention Notification**
1. Login as Alice
2. Create a post: "Hey @Bob check out my new project!"
3. Logout, login as Bob
4. **✅ Bob sees notification bell with badge (1)**
5. Click bell → sees "Alice tagged you in a post"
6. Click notification → navigates to Alice's post

### **Step 3: Test Like Notification**
1. Still logged in as Bob
2. Like Alice's post
3. Logout, login as Alice
4. **✅ Alice sees notification: "Bob liked your post"**

### **Step 4: Test Comment Notification**
1. Still logged in as Alice
2. Go to Bob's profile, find a post
3. Add comment: "Nice work!"
4. Logout, login as Bob
5. **✅ Bob sees notification: "Alice commented on your post"**

### **Step 5: Test Comment with @Mention**
1. Login as Alice
2. Comment on a post: "What do you think @Bob?"
3. Logout, login as Bob
4. **✅ Bob sees TWO notifications:**
   - "Alice commented on your post" (if it's Bob's post)
   - "Alice tagged you in a comment"

### **Step 6: Test Direct Message**
1. Login as Alice
2. Go to Messages (chat icon)
3. Start conversation with Bob
4. Send: "Hey Bob, how are you?"
5. Logout, login as Bob
6. **✅ Bob sees notification: "Alice sent you a message"**

### **Step 7: Test Real-Time WebSocket**
1. Open two browsers side-by-side
2. Browser 1: Login as Alice
3. Browser 2: Login as Bob
4. Browser 1 (Alice): Create post with "@Bob awesome!"
5. Browser 2 (Bob): **Watch notification badge update INSTANTLY** 🎉

---

## 🎯 What to Verify

### ✅ **Notification Badge**
- Shows unread count
- Updates in real-time
- Shows "99+" for 100+ notifications
- Yellow dot when WebSocket disconnected

### ✅ **Notification Dropdown**
- Shows last 5 notifications
- Unread items have blue background
- Click notification → navigates to content
- Delete button works
- "Mark all as read" works

### ✅ **Notifications Page (/notifications)**
- Access via "See all notifications" link
- Grouped by date (Today, Yesterday, etc.)
- Filter tabs (All, Unread, Read)
- Infinite scroll (load more)
- Delete individual notifications

### ✅ **WebSocket Connection**
- Connection indicator on bell icon
- Auto-reconnects if disconnected
- Real-time notification delivery (< 1 second)

---

## 🔍 Check Backend Logs

When Alice tags Bob, you should see:
```
UserTaggedEvent published
NotificationEventListener: handleUserTaggedEvent
NotificationService: createTagNotification
Notification saved: TAG_IN_POST
WebSocket push to user: bob_user_id
```

---

## 📊 Monitor MongoDB

```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use lnmconnect

# View all notifications
db.notifications.find().pretty()

# Count unread notifications for Bob
db.notifications.countDocuments({ receiverId: "bob_user_id", isRead: false })

# Find notifications by type
db.notifications.find({ type: "TAG_IN_POST" }).pretty()

# Check indexes
db.notifications.getIndexes()
```

---

## 🐛 Common Issues & Fixes

### **Issue: No notifications appearing**
**Fix:**
1. Check MongoDB is running: `mongosh`
2. Check backend console for errors
3. Verify user exists in database:
   ```javascript
   db.users.findOne({ name: "Bob" })
   ```

### **Issue: WebSocket not connecting (yellow dot)**
**Fix:**
1. Check backend is running on port 8080
2. Check browser console for WebSocket errors
3. Try refreshing the page
4. Check CORS configuration in `NotificationWebSocketConfig.java`

### **Issue: Badge not updating in real-time**
**Fix:**
1. Check WebSocket connection (no yellow dot)
2. Open browser console, look for:
   ```
   WebSocket connected
   Subscribed to /user/queue/notifications
   ```
3. Check `NotificationContext` is wrapped around App

### **Issue: Click notification doesn't navigate**
**Fix:**
1. Check `actionUrl` field in notification
2. Verify routes exist in `App.jsx`
3. Check browser console for navigation errors

---

## 🧪 Advanced Testing

### **Test WebSocket Connection (Browser Console)**
```javascript
// This should show "Connected: ..."
const socket = new SockJS('http://localhost:8080/ws/notifications');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
  console.log('Connected:', frame);
  
  // Subscribe to notifications
  stompClient.subscribe('/user/queue/notifications', (message) => {
    console.log('New notification:', JSON.parse(message.body));
  });
});
```

### **Create Test Notification (Backend)**
```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your_user_id",
    "message": "This is a test notification!"
  }'
```

### **Check API Endpoints**
```bash
# Get notifications
curl "http://localhost:8080/api/notifications?userId=user_id&page=0&size=20"

# Get unread count
curl "http://localhost:8080/api/notifications/unread-count?userId=user_id"

# Mark as read
curl -X PUT "http://localhost:8080/api/notifications/{notificationId}/read"

# Mark all as read
curl -X PUT "http://localhost:8080/api/notifications/mark-all-read?userId=user_id"

# Delete notification
curl -X DELETE "http://localhost:8080/api/notifications/{notificationId}?userId=user_id"
```

---

## 📈 Performance Monitoring

### **Check WebSocket Connection Health**
```javascript
// In NotificationContext.jsx, uncomment debug:
debug: (str) => {
  console.log('STOMP debug:', str);
}
```

### **Monitor Notification Creation Speed**
```java
// In NotificationService.java, add logging:
System.out.println("Notification created in: " + (System.currentTimeMillis() - start) + "ms");
```

### **Check MongoDB Query Performance**
```javascript
// Enable profiling
db.setProfilingLevel(2)

// View slow queries
db.system.profile.find({ millis: { $gt: 100 } }).pretty()

// Check index usage
db.notifications.find({ receiverId: "user_id" }).explain("executionStats")
```

---

## 🎨 Customize Notification Appearance

### **Change Notification Icons**
Edit `NotificationDropdown.jsx` or `NotificationsPage.jsx`:
```javascript
const getNotificationIcon = (type) => {
  switch (type) {
    case 'TAG_IN_POST': return '🏷️';  // Change to your icon
    case 'NEW_MESSAGE': return '💬';
    // ...
  }
};
```

### **Change Notification Sound**
1. Add `notification.mp3` to `frontend/public/`
2. Uncomment in `NotificationContext.jsx`:
```javascript
const audio = new Audio('/notification.mp3');
audio.play().catch(e => console.log('Audio play failed:', e));
```

### **Change Badge Color**
In `NotificationDropdown.jsx`:
```javascript
// Current: red badge
<span className="... bg-red-600 ...">

// Change to blue
<span className="... bg-blue-600 ...">
```

---

## 🚀 Deploy to Production

### **Backend Changes Needed:**
1. **Restrict CORS** in `NotificationWebSocketConfig.java`:
   ```java
   .setAllowedOriginPatterns("https://yourdomain.com")
   ```

2. **Use Environment Variables**:
   ```properties
   # application.properties
   notification.websocket.endpoint=wss://api.yourdomain.com/ws/notifications
   ```

3. **Enable HTTPS** for WebSocket (WSS):
   ```java
   // In application.properties
   server.ssl.enabled=true
   server.ssl.key-store=classpath:keystore.p12
   ```

### **Frontend Changes Needed:**
1. **Update API URL** in `notificationService.js`:
   ```javascript
   const API_URL = 'https://api.yourdomain.com/api/notifications';
   ```

2. **Update WebSocket URL** in `NotificationContext.jsx`:
   ```javascript
   webSocketFactory: () => new SockJS('https://api.yourdomain.com/ws/notifications')
   ```

---

## 📚 Additional Resources

- **NOTIFICATION_SYSTEM_FINAL.md** - Complete implementation details
- **NOTIFICATION_TESTING_GUIDE.md** - Comprehensive testing scenarios
- **Backend API Docs** - OpenAPI/Swagger at http://localhost:8080/swagger-ui.html

---

## ✅ Success Checklist

Before considering the system complete, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] MongoDB connection successful
- [ ] WebSocket connects (no yellow dot)
- [ ] Tag notification works (@mention in post)
- [ ] Like notification works
- [ ] Comment notification works
- [ ] DM notification works
- [ ] Real-time delivery (< 1 second)
- [ ] Badge updates automatically
- [ ] Click notification navigates
- [ ] Mark as read works
- [ ] Delete notification works
- [ ] Notifications page loads
- [ ] Infinite scroll works
- [ ] Filter tabs work
- [ ] "Mark all as read" works

---

## 🎉 You're Done!

Your LNMConnect platform now has a **fully functional, real-time notification system**!

**Enjoy your notifications! 🔔✨**

---

**Need help?** Check the comprehensive guides:
- `NOTIFICATION_SYSTEM_FINAL.md` - Full documentation
- `NOTIFICATION_TESTING_GUIDE.md` - Testing scenarios
- `NOTIFICATION_SYSTEM_COMPLETE.md` - Technical details
