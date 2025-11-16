# 🚀 Notification System - Quick Start Testing Guide

## Prerequisites
- Backend running on `http://localhost:8080`
- MongoDB running and connected
- At least 2 user accounts created in database

---

## 🧪 Test Scenarios

### **Test 1: Tag Notification (@mention in post)**

1. **Create a post with @mention**
   ```bash
   POST http://localhost:8080/api/posts
   Content-Type: application/json
   
   {
     "authorId": "user1_id",
     "authorName": "Alice",
     "body": "Hey @Bob check out this project!",
     "title": "New Project",
     "tags": ["project"],
     "likes": [],
     "comments": []
   }
   ```

2. **Check Bob's notifications**
   ```bash
   GET http://localhost:8080/api/notifications?userId=bob_user_id&page=0&size=20
   ```

3. **Expected Result**
   ```json
   {
     "notifications": [
       {
         "id": "...",
         "receiverId": "bob_user_id",
         "senderId": "user1_id",
         "senderName": "Alice",
         "type": "TAG_IN_POST",
         "message": "Alice tagged you in a post",
         "entityId": "post_id",
         "entityType": "post",
         "isRead": false,
         "actionUrl": "/post/post_id",
         "previewText": "Hey @Bob check out this project!",
         "createdAt": 1704067200000
       }
     ],
     "unreadCount": 1,
     "page": 0,
     "size": 20,
     "hasMore": false
   }
   ```

---

### **Test 2: Like Notification**

1. **Like a post**
   ```bash
   POST http://localhost:8080/api/posts/{postId}/like?userId=user2_id
   ```

2. **Check post author's notifications**
   ```bash
   GET http://localhost:8080/api/notifications?userId=post_author_id&page=0&size=20
   ```

3. **Expected Result**
   - Notification with `type: "POST_LIKE"`
   - Message: "User2Name liked your post"
   - `actionUrl` points to the post

---

### **Test 3: Comment Notification**

1. **Add comment to post**
   ```bash
   POST http://localhost:8080/api/posts/{postId}/comment
   Content-Type: application/json
   
   {
     "userId": "commenter_id",
     "userName": "Charlie",
     "text": "Great post!",
     "timestamp": 1704067200000
   }
   ```

2. **Check post author's notifications**
   ```bash
   GET http://localhost:8080/api/notifications?userId=post_author_id
   ```

3. **Expected Result**
   - Notification with `type: "NEW_COMMENT"`
   - Message: "Charlie commented on your post"
   - `previewText` shows comment text

---

### **Test 4: Tag in Comment**

1. **Add comment with @mention**
   ```bash
   POST http://localhost:8080/api/posts/{postId}/comment
   Content-Type: application/json
   
   {
     "userId": "commenter_id",
     "userName": "Charlie",
     "text": "@Dave what do you think?",
     "timestamp": 1704067200000
   }
   ```

2. **Check Dave's notifications**
   ```bash
   GET http://localhost:8080/api/notifications?userId=dave_user_id
   ```

3. **Expected Result**
   - Notification with `type: "TAG_IN_COMMENT"`
   - Message: "Charlie tagged you in a comment"

---

### **Test 5: Mark as Read**

1. **Get unread count**
   ```bash
   GET http://localhost:8080/api/notifications/unread-count?userId=user_id
   ```

2. **Mark single notification as read**
   ```bash
   PUT http://localhost:8080/api/notifications/{notificationId}/read
   ```

3. **Check unread count again**
   ```bash
   GET http://localhost:8080/api/notifications/unread-count?userId=user_id
   ```

4. **Expected Result**: Count decreased by 1

---

### **Test 6: Mark All as Read**

1. **Mark all as read**
   ```bash
   PUT http://localhost:8080/api/notifications/mark-all-read?userId=user_id
   ```

2. **Check unread count**
   ```bash
   GET http://localhost:8080/api/notifications/unread-count?userId=user_id
   ```

3. **Expected Result**: `{ "count": 0 }`

---

### **Test 7: Delete Notification**

1. **Delete a notification**
   ```bash
   DELETE http://localhost:8080/api/notifications/{notificationId}?userId=user_id
   ```

2. **Fetch notifications again**
   ```bash
   GET http://localhost:8080/api/notifications?userId=user_id
   ```

3. **Expected Result**: Notification no longer in list

---

### **Test 8: Test Notification Endpoint**

1. **Create test notification**
   ```bash
   POST http://localhost:8080/api/notifications/test
   Content-Type: application/json
   
   {
     "userId": "your_user_id",
     "message": "This is a test notification!"
   }
   ```

2. **Check notifications**
   ```bash
   GET http://localhost:8080/api/notifications?userId=your_user_id
   ```

3. **Expected Result**: SYSTEM_ALERT notification appears

---

## 🔌 WebSocket Testing (Browser Console)

### **Connect to WebSocket**

```javascript
// Option 1: Using SockJS + Stomp
const socket = new SockJS('http://localhost:8080/ws/notifications');
const stompClient = Stomp.over(socket);

stompClient.connect({}, function(frame) {
  console.log('Connected: ' + frame);
  
  // Subscribe to user-specific notifications
  stompClient.subscribe('/user/queue/notifications', function(message) {
    const notification = JSON.parse(message.body);
    console.log('New notification:', notification);
  });
  
  // Subscribe to unread count updates
  stompClient.subscribe('/user/queue/unread-count', function(message) {
    const count = JSON.parse(message.body);
    console.log('Unread count:', count);
  });
});
```

### **Test Real-Time Push**

1. Open browser console with WebSocket connection active
2. Use another tool (Postman/curl) to create a notification for your user
3. Watch console for real-time notification delivery

---

## 🧩 Integration Testing Workflow

### **Scenario: Complete Post Interaction**

```bash
# Step 1: Alice creates a post mentioning Bob
POST /api/posts
{
  "authorId": "alice_id",
  "authorName": "Alice",
  "body": "Hey @Bob check this out!",
  ...
}

# Result: Bob gets TAG_IN_POST notification

# Step 2: Charlie likes Alice's post
POST /api/posts/{postId}/like?userId=charlie_id

# Result: Alice gets POST_LIKE notification

# Step 3: Dave comments on Alice's post mentioning Eve
POST /api/posts/{postId}/comment
{
  "userId": "dave_id",
  "userName": "Dave",
  "text": "Great post! @Eve you should see this"
}

# Result:
# - Alice gets NEW_COMMENT notification (post author)
# - Eve gets TAG_IN_COMMENT notification (mentioned in comment)

# Step 4: Check Alice's notification feed
GET /api/notifications?userId=alice_id

# Expected: 2 notifications (POST_LIKE + NEW_COMMENT)
```

---

## 🐛 Debugging Tips

### **No Notifications Created?**
1. Check MongoDB connection:
   ```bash
   # In MongoDB shell
   use lnmconnect
   db.notifications.find()
   ```

2. Check console logs for errors:
   ```bash
   # Look for event publishing errors
   grep "UserTaggedEvent" backend.log
   ```

3. Verify user exists:
   ```bash
   # Check if @mentioned username exists in database
   db.users.findOne({ name: "Bob" })
   ```

### **WebSocket Not Connecting?**
1. Check CORS configuration in `NotificationWebSocketConfig.java`
2. Try with SockJS fallback (automatically handled)
3. Verify endpoint: `ws://localhost:8080/ws/notifications`

### **Notifications Not Pushed?**
1. Check WebSocket subscription path: `/user/queue/notifications`
2. Verify user is connected with correct userId
3. Check `SimpMessagingTemplate` logs in NotificationService

---

## 📊 Monitoring Queries

### **Check All Notifications**
```javascript
// MongoDB shell
db.notifications.find().sort({ createdAt: -1 }).limit(10)
```

### **Count Notifications by Type**
```javascript
db.notifications.aggregate([
  { $group: { _id: "$type", count: { $sum: 1 } } }
])
```

### **Find Unread Notifications**
```javascript
db.notifications.find({ isRead: false, receiverId: "user_id" })
```

### **Check Indexes**
```javascript
db.notifications.getIndexes()
```

---

## ✅ Expected Database State

After creating test data, your `notifications` collection should look like:

```javascript
{
  "_id": ObjectId("..."),
  "receiverId": "bob_user_id",
  "senderId": "alice_user_id",
  "senderName": "Alice",
  "senderAvatar": null,
  "type": "TAG_IN_POST",
  "message": "Alice tagged you in a post",
  "entityId": "post123",
  "entityType": "post",
  "isRead": false,
  "createdAt": NumberLong(1704067200000),
  "actionUrl": "/post/post123",
  "previewText": "Hey @Bob check this out!",
  "_class": "com.miniproject.backend.model.Notification"
}
```

---

## 🎯 Success Criteria

✅ **Tag notifications work** - Mentioning @username creates notification
✅ **Like notifications work** - Liking a post notifies author
✅ **Comment notifications work** - Commenting notifies post author
✅ **Tag in comments work** - @mention in comments creates separate notification
✅ **WebSocket pushes work** - Real-time delivery to connected clients
✅ **Pagination works** - Can fetch pages of notifications
✅ **Mark as read works** - Updates isRead field
✅ **Unread count accurate** - Matches number of isRead=false notifications
✅ **No self-notifications** - User can't tag themselves

---

## 🚀 Next Steps

Once all backend tests pass:

1. **Create frontend NotificationContext**
2. **Build NotificationDropdown component**
3. **Add bell icon to HeaderNav**
4. **Create /notifications page**
5. **Connect WebSocket in frontend**
6. **Add animations and transitions**

---

## 📝 Test Data Template

Use this script to populate test data:

```javascript
// MongoDB shell - Create test users
db.users.insertMany([
  { _id: "alice_id", name: "Alice", email: "alice@test.com" },
  { _id: "bob_id", name: "Bob", email: "bob@test.com" },
  { _id: "charlie_id", name: "Charlie", email: "charlie@test.com" }
]);

// Create test post
db.posts.insertOne({
  _id: "post1",
  authorId: "alice_id",
  authorName: "Alice",
  body: "Check out my new project!",
  title: "My Project",
  tags: ["project"],
  likes: [],
  comments: [],
  createdAt: NumberLong(1704067200000)
});
```

---

**Happy Testing! 🎉**

If any test fails, check the detailed error logs in the backend console and refer to the debugging section above.
