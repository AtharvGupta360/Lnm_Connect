# Delete & Moderation Features Implementation

## Overview
Complete implementation of content deletion, nested comment replies, and moderator management features for LNM Connect. All backend endpoints and frontend services are now ready.

## Backend Implementation

### 1. Delete Features

#### Post Deletion
**Controller:** `PostController.java`
**Endpoint:** `DELETE /api/posts/{postId}?userId=xxx`
**Authorization:** Author only
**Method:**
```java
@DeleteMapping("/{postId}")
public ResponseEntity<Void> deletePost(
    @PathVariable String postId,
    @RequestParam String userId
)
```
- Validates that the userId matches the post's authorId
- Permanently deletes the post from the database
- Returns 204 No Content on success
- Throws RuntimeException if unauthorized

#### Thread Deletion
**Controller:** `ThreadController.java`
**Endpoint:** `DELETE /api/threads/{id}?userId=xxx`
**Authorization:** Author only
**Already Implemented:** ✅

#### Space Deletion
**Controller:** `SpaceController.java` (NEW)
**Endpoint:** `DELETE /api/spaces/{id}?userId=xxx`
**Authorization:** Creator only
**Service Method:** `SpaceService.deleteSpace()`
```java
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteSpace(
    @PathVariable String id,
    @RequestParam String userId
)
```
- Validates that userId matches space.creatorId
- Deletes all threads in the space
- Deletes all votes and comments associated with threads
- Permanently deletes the space
- Returns 204 No Content on success

### 2. Moderator Management

#### Add Moderator
**Controller:** `SpaceController.java` (NEW)
**Endpoint:** `POST /api/spaces/{id}/moderators`
**Body:** `{ "userId": "...", "moderatorId": "..." }`
**Authorization:** Creator or existing moderator
**Service Method:** `SpaceService.addModerator()`
```java
@PostMapping("/{id}/moderators")
public ResponseEntity<SpaceDTO> addModerator(
    @PathVariable String id,
    @RequestBody Map<String, String> request
)
```
- Validates userId is creator or moderator
- Validates newModeratorId is a member of the space
- Adds moderatorId to space.moderatorIds list
- Returns updated SpaceDTO

#### Remove Moderator
**Controller:** `SpaceController.java` (NEW)
**Endpoint:** `DELETE /api/spaces/{id}/moderators/{moderatorId}?userId=xxx`
**Authorization:** Creator only
**Service Method:** `SpaceService.removeModerator()`
```java
@DeleteMapping("/{id}/moderators/{moderatorId}")
public ResponseEntity<SpaceDTO> removeModerator(
    @PathVariable String id,
    @PathVariable String moderatorId,
    @RequestParam String userId
)
```
- Validates userId is the creator
- Prevents removing the creator from moderators
- Removes moderatorId from space.moderatorIds list
- Returns updated SpaceDTO

### 3. Comment Reply System (Already Implemented)

**Model:** `ThreadComment.java`
**Field:** `String parentCommentId`

**Controller:** `ThreadCommentController.java`
**Endpoint:** `POST /api/threads/{threadId}/comments`
**Body:**
```json
{
  "userId": "...",
  "content": "...",
  "parentCommentId": "..." // Optional - null for top-level comments
}
```

**Features:**
- Nested replies supported via parentCommentId
- Top-level comments have parentCommentId = null
- Backend validates thread is not locked
- Backend validates user is member of space

## Frontend Services

### 1. Post Service (NEW)
**File:** `frontend/src/services/postService.js`

**Methods:**
```javascript
// Delete a post (author only)
postService.deletePost(postId, userId)

// Get all posts
postService.getAllPosts(userId, page, size)

// Get post by ID
postService.getPostById(postId)

// Update post
postService.updatePost(postId, postData)

// Apply to post
postService.applyToPost(postId, userId)

// Accept/reject applications
postService.acceptApplication(applicationId, ownerId)
postService.rejectApplication(applicationId, ownerId)
```

### 2. Space Service (ENHANCED)
**File:** `frontend/src/services/spaceService.js`

**New Methods:**
```javascript
// Delete space (creator only)
spaceService.deleteSpace(spaceId, userId)

// Add moderator
spaceService.addModerator(spaceId, userId, moderatorId)

// Remove moderator (creator only)
spaceService.removeModerator(spaceId, userId, moderatorId)
```

**Existing Methods:**
- `createSpace()`
- `getAllSpaces()`
- `getSpaceById()`
- `joinSpace()`
- `leaveSpace()`
- `getUserSpaces()`

### 3. Thread Service (COMPLETE)
**File:** `frontend/src/services/threadService.js`

**All Methods Available:**
```javascript
// Thread CRUD
threadService.createThread(userId, spaceId, title, content, tags)
threadService.getThreadsBySpace(spaceId, userId)
threadService.getThreadById(threadId, userId)
threadService.updateThread(threadId, userId, title, content, tags)
threadService.deleteThread(threadId, userId) // Author only

// Moderation
threadService.togglePin(threadId, userId) // Moderator only
threadService.toggleLock(threadId, userId) // Moderator only

// Voting
threadService.voteThread(userId, threadId, value) // 1 or -1
threadService.getUserVoteOnThread(userId, threadId)

// Comments with Reply Support
threadService.addComment(userId, threadId, content, parentCommentId)
threadService.getComments(threadId, userId)
threadService.updateComment(commentId, userId, content)
threadService.deleteComment(commentId, userId)
threadService.voteComment(userId, commentId, value)
threadService.getUserVoteOnComment(userId, commentId)
```

## Frontend UI Implementation Tasks

### 1. Delete Buttons

#### For Posts
**Location:** Post cards in feed, profile page
**Implementation:**
```jsx
import { postService } from '../services/postService';

const handleDeletePost = async (postId) => {
  if (!window.confirm('Are you sure you want to delete this post?')) return;
  
  try {
    await postService.deletePost(postId, currentUser.id);
    // Remove from state or refresh list
  } catch (error) {
    alert('Failed to delete post: ' + error.message);
  }
};

// Show button only for author
{post.authorId === currentUser.id && (
  <button onClick={() => handleDeletePost(post.id)}>Delete</button>
)}
```

#### For Threads
**Location:** SpaceDetailPage (thread list), ThreadDetailPage (thread header)
**Implementation:**
```jsx
import { threadService } from '../services/threadService';

const handleDeleteThread = async (threadId) => {
  if (!window.confirm('Are you sure you want to delete this thread?')) return;
  
  try {
    await threadService.deleteThread(threadId, currentUser.id);
    // Navigate back to space or refresh list
  } catch (error) {
    alert('Failed to delete thread: ' + error.message);
  }
};

// Show button only for author
{thread.authorId === currentUser.id && (
  <button onClick={() => handleDeleteThread(thread.id)}>Delete</button>
)}
```

#### For Spaces
**Location:** SpaceDetailPage management modal
**Implementation:**
```jsx
import { spaceService } from '../services/spaceService';

const handleDeleteSpace = async () => {
  if (!window.confirm('This will permanently delete the space and all its content. Are you sure?')) return;
  
  try {
    await spaceService.deleteSpace(space.id, currentUser.id);
    // Navigate to spaces list
    navigate('/forums');
  } catch (error) {
    alert('Failed to delete space: ' + error.message);
  }
};

// Show button only for creator
{space.creatorId === currentUser.id && (
  <button onClick={handleDeleteSpace} className="bg-red-500">
    Delete Space
  </button>
)}
```

### 2. Reply to Comments UI

**Location:** ThreadDetailPage, any component showing comments
**Structure:**
```jsx
import { useState } from 'react';
import { threadService } from '../services/threadService';

function CommentItem({ comment, threadId, onReplySubmit }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  const handleReply = async () => {
    try {
      const newReply = await threadService.addComment(
        currentUser.id,
        threadId,
        replyContent,
        comment.id // parentCommentId
      );
      setReplyContent('');
      setShowReplyForm(false);
      onReplySubmit(newReply);
    } catch (error) {
      alert('Failed to post reply: ' + error.message);
    }
  };
  
  return (
    <div className="comment">
      <p>{comment.content}</p>
      <button onClick={() => setShowReplyForm(!showReplyForm)}>
        Reply
      </button>
      
      {showReplyForm && (
        <div className="reply-form">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
          />
          <button onClick={handleReply}>Submit Reply</button>
          <button onClick={() => setShowReplyForm(false)}>Cancel</button>
        </div>
      )}
      
      {/* Render nested replies */}
      {comment.replies?.length > 0 && (
        <div className="nested-replies ml-6">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              threadId={threadId}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Note:** Backend returns flat list of comments. Frontend needs to build tree structure:
```jsx
// Group comments by parentCommentId
const buildCommentTree = (comments) => {
  const commentMap = {};
  const roots = [];
  
  // First pass: create map
  comments.forEach(comment => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });
  
  // Second pass: build tree
  comments.forEach(comment => {
    if (comment.parentCommentId) {
      const parent = commentMap[comment.parentCommentId];
      if (parent) {
        parent.replies.push(commentMap[comment.id]);
      }
    } else {
      roots.push(commentMap[comment.id]);
    }
  });
  
  return roots;
};
```

### 3. Moderator Management UI

**Location:** SpaceDetailPage management modal (creator/moderator only)
**Implementation:**
```jsx
import { useState, useEffect } from 'react';
import { spaceService } from '../services/spaceService';

function ModeratorManagement({ space, currentUser }) {
  const [selectedMember, setSelectedMember] = useState('');
  
  const handleAddModerator = async () => {
    if (!selectedMember) return;
    
    try {
      const updatedSpace = await spaceService.addModerator(
        space.id,
        currentUser.id,
        selectedMember
      );
      // Update space state
    } catch (error) {
      alert('Failed to add moderator: ' + error.message);
    }
  };
  
  const handleRemoveModerator = async (moderatorId) => {
    if (!window.confirm('Remove this user as moderator?')) return;
    
    try {
      const updatedSpace = await spaceService.removeModerator(
        space.id,
        currentUser.id,
        moderatorId
      );
      // Update space state
    } catch (error) {
      alert('Failed to remove moderator: ' + error.message);
    }
  };
  
  // Show only to creator or moderators
  if (!space.moderatorIds.includes(currentUser.id)) {
    return null;
  }
  
  return (
    <div className="moderator-management">
      <h3>Moderators</h3>
      
      <ul>
        {space.moderatorIds.map(modId => (
          <li key={modId}>
            {/* Display user name/avatar */}
            {space.creatorId === currentUser.id && modId !== space.creatorId && (
              <button onClick={() => handleRemoveModerator(modId)}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      
      {/* Only creator/mods can add moderators */}
      {space.moderatorIds.includes(currentUser.id) && (
        <div className="add-moderator">
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          >
            <option value="">Select member...</option>
            {space.memberIds
              .filter(id => !space.moderatorIds.includes(id))
              .map(id => (
                <option key={id} value={id}>
                  {/* Display user name */}
                </option>
              ))}
          </select>
          <button onClick={handleAddModerator}>Add Moderator</button>
        </div>
      )}
    </div>
  );
}
```

## Authorization Summary

| Action | Who Can Do It |
|--------|---------------|
| Delete Post | Post author only |
| Delete Thread | Thread author only |
| Delete Space | Space creator only |
| Delete Comment | Comment author only |
| Add Moderator | Space creator or existing moderators |
| Remove Moderator | Space creator only |
| Reply to Comment | Any space member |
| Vote | Any space member |
| Pin/Lock Thread | Space moderators only |

## Testing Checklist

### Backend Endpoints
- [ ] Test POST delete with author - should succeed
- [ ] Test POST delete with non-author - should fail (403)
- [ ] Test thread delete with author - should succeed
- [ ] Test thread delete with non-author - should fail
- [ ] Test space delete with creator - should succeed
- [ ] Test space delete with non-creator - should fail
- [ ] Test add moderator as creator - should succeed
- [ ] Test add moderator as existing mod - should succeed
- [ ] Test add moderator as regular member - should fail
- [ ] Test remove moderator as creator - should succeed
- [ ] Test remove moderator as non-creator - should fail
- [ ] Test reply to comment with parentCommentId - should nest correctly

### Frontend Integration
- [ ] Delete button appears only for content owner
- [ ] Delete confirmation dialog works
- [ ] Content removed from UI after deletion
- [ ] Reply button on comments works
- [ ] Reply form appears and submits
- [ ] Nested replies display with indentation
- [ ] Moderator list displays correctly
- [ ] Add moderator dropdown shows non-moderator members
- [ ] Remove moderator button shows only for creator
- [ ] All error messages display properly

## Next Steps

1. **Add Delete Buttons to UI Components:**
   - Posts: Feed.jsx, ProfilePage.jsx, CampusBuzz.jsx
   - Threads: SpaceDetailPage.jsx (ThreadCard), ThreadDetailPage.jsx
   - Spaces: SpaceDetailPage.jsx (ManageSpaceModal)

2. **Implement Reply UI in Comment Components:**
   - Add Reply button to CommentItem component
   - Create inline reply form
   - Build comment tree structure from flat list
   - Style nested comments with indentation

3. **Add Moderator Management to SpaceDetailPage:**
   - Create ModeratorManagement component or section
   - Add to ManageSpaceModal
   - Show moderator list with avatars/names
   - Add member selection dropdown
   - Add/Remove buttons with proper authorization checks

4. **Testing:**
   - Test all delete operations with correct authorization
   - Test moderator add/remove flows
   - Test nested comment replies
   - Verify error handling for unauthorized actions

## API Quick Reference

### Delete Endpoints
```
DELETE /api/posts/{postId}?userId=xxx
DELETE /api/threads/{id}?userId=xxx
DELETE /api/spaces/{id}?userId=xxx
DELETE /api/comments/{id}?userId=xxx
```

### Moderator Endpoints
```
POST /api/spaces/{id}/moderators
Body: { "userId": "...", "moderatorId": "..." }

DELETE /api/spaces/{id}/moderators/{moderatorId}?userId=xxx
```

### Comment Reply Endpoint
```
POST /api/threads/{threadId}/comments
Body: {
  "userId": "...",
  "content": "...",
  "parentCommentId": "..." // null for top-level
}
```

## Status: Backend Complete ✅
- All delete endpoints implemented
- Moderator management endpoints implemented
- Comment reply system complete
- Frontend services created/updated
- Backend compiled and running on localhost:8080

## Status: Frontend UI In Progress 🔄
- Need to add delete buttons with authorization checks
- Need to implement reply-to-comment UI
- Need to implement nested comment display
- Need to add moderator management UI
