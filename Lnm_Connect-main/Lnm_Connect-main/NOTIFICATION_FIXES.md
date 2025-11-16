# 🔧 Notification System Bug Fixes

## Issues Fixed

### 1. **Wrong User Receiving Notifications** ✅
**Problem**: User "brokeboi" was receiving notifications meant for "test" account.

**Root Cause**: WebSocket connection wasn't properly authenticated with userId, so Spring couldn't determine which user to send notifications to.

**Solution**:
- Added `userId` in WebSocket connection headers (frontend)
- Created `WebSocketChannelInterceptor` to extract userId from headers
- Set user Principal in WebSocket session for proper user-specific routing

**Files Modified**:
- `frontend/src/contexts/NotificationContext.jsx` - Added `connectHeaders: { userId: currentUserId }`
- `backend/src/main/java/com/miniproject/backend/config/WebSocketChannelInterceptor.java` - NEW FILE
- `backend/src/main/java/com/miniproject/backend/config/WebSocketConfig.java` - Registered interceptor

---

### 2. **Navigation Not Working** (Next to fix)
**Problem**: Clicking notifications doesn't navigate to the correct post/thread/comment.

**Investigation Needed**:
- Check if `actionUrl` in notifications is correct
- Verify navigation logic in `NotificationDropdown.jsx`
- Test different notification types

**Current Navigation Logic**:
```javascript
if (notification.type === 'NEW_MESSAGE') {
  navigate(`/chat?userId=${notification.senderId}`);
} else if (notification.type === 'THREAD_REPLY' || notification.type === 'THREAD_MENTION') {
  navigate(`/threads/${notification.entityId}`);
} else if (notification.type === 'NEW_FOLLOWER') {
  navigate(`/profile/${notification.senderId}`);
} else if (notification.actionUrl) {
  navigate(notification.actionUrl);
}
```

**Potential Issues**:
- `actionUrl` format might be incorrect
- Post navigation URL: `/?highlightPost={postId}` - might need to be `/post/{postId}`
- entityId might not be the correct ID for navigation

---

### 3. **Comment Reply Notifications Not Working** (Needs investigation)
**Problem**: Not receiving notifications for comment replies.

**Possible Causes**:
1. Post comments don't have `parentCommentId` field (flat structure)
2. Backend not creating COMMENT_REPLY notifications
3. Frontend not detecting comment replies

**Current Post Comment Model**:
```java
public class Comment {
    private String userId;
    private String userName;
    private String text;
    private long timestamp;
    // NO parentCommentId field!
}
```

**This is the issue!** Post comments are flat - there's no reply structure. The system only creates NEW_COMMENT notifications for all comments on a post.

---

## Testing Instructions

### 1. Test WebSocket User Authentication Fix

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**Test Steps:**
1. Open browser window 1 → Login as "test"
2. Open browser window 2 → Login as "brokeboi"
3. As "brokeboi": Create a post
4. As "test": Like/comment on brokeboi's post
5. **Check**: brokeboi should receive notification (NOT test)
6. As "test": Create a post
7. As "brokeboi": Like/comment on test's post
8. **Check**: test should receive notification (NOT brokeboi)

**Expected Result**: Each user only receives notifications intended for them.

---

### 2. Test Navigation (After identifying correct URLs)

**Test Post Notification Navigation:**
1. User A: Create a post
2. User B: Like the post
3. User A: Click notification
4. **Check**: Navigate to the post (correct post highlighted)

**Test Thread Notification Navigation:**
1. User A: Create a thread
2. User B: Comment on thread
3. User A: Click notification
4. **Check**: Navigate to `/threads/{threadId}` showing the thread

**Test DM Notification Navigation:**
1. User A: Send message to User B
2. User B: Click notification
3. **Check**: Navigate to chat with User A

---

### 3. Investigate Comment Replies

**Current Situation**: Post comments don't support replies (flat structure).

**Options**:
1. **Keep as is**: All post comments notify post author only
2. **Add reply support**: Modify Comment model to include `parentCommentId`
3. **Clarify**: Thread comments DO support replies (already implemented)

**Thread comments** (different from post comments) already have:
- `parentCommentId` field
- COMMENT_REPLY notifications
- THREAD_REPLY notifications
- Full reply support

---

## Next Steps

### Immediate:
1. ✅ **DONE**: Fix WebSocket user authentication
2. ⏳ **TEST**: Restart backend and frontend, test notifications go to correct user
3. ⏳ **INVESTIGATE**: Check browser console for notification data structure
4. ⏳ **FIX**: Update navigation URLs if needed

### After Testing:
1. If navigation broken: Fix `actionUrl` generation in NotificationService
2. If comment replies needed for posts: Add `parentCommentId` to Comment model
3. Test all notification types end-to-end

---

## How to Debug

### Check Notification Data Structure:
Open browser console when notification arrives:
```javascript
// Should log notification object
console.log('New notification received:', notification);
```

**Check these fields**:
- `receiverId` - Should match logged-in user
- `senderId` - Should be the user who performed action
- `actionUrl` - Should be valid navigation path
- `entityId` - Should be the correct ID for the entity
- `type` - Should match the action

### Check WebSocket Connection:
Look for in console:
```
WebSocket connected for user: {userId}
```

### Check Backend Logs:
Look for:
```
WebSocket connection established for user: {userId}
```

---

## Files Changed

### Backend:
1. `backend/src/main/java/com/miniproject/backend/config/WebSocketChannelInterceptor.java` - **NEW**
2. `backend/src/main/java/com/miniproject/backend/config/WebSocketConfig.java` - Modified

### Frontend:
1. `frontend/src/contexts/NotificationContext.jsx` - Modified

---

## Restart Required!

⚠️ **You MUST restart both backend and frontend for WebSocket changes to take effect!**

```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend  
cd frontend
npm run dev
```
