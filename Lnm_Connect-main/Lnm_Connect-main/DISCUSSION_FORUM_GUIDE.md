# Discussion Forum System - Implementation Guide

## Overview
A Reddit-style discussion forum with spaces, threads, nested comments, voting, and moderation.

## Backend Structure

### Models Created ✅
- `Space.java` - Forums/Communities
- `Thread.java` - Discussion posts
- `ThreadComment.java` - Nested comments
- `Vote.java` - Voting system
- `Report.java` - Content moderation

### Repositories Created ✅
- `SpaceRepository.java`
- `ThreadRepository.java`
- `ThreadCommentRepository.java`
- `VoteRepository.java`
- `ReportRepository.java`

### DTOs Created ✅
- `SpaceDTO.java`
- `ThreadDTO.java`
- `CommentDTO.java`
- `VoteRequest.java`
- `ReportDTO.java`

## API Endpoints (To Be Implemented)

### Spaces
```
POST   /api/spaces                      → Create new space
GET    /api/spaces                      → List all spaces
GET    /api/spaces/{id}                 → Get space details
POST   /api/spaces/{id}/join            → Join space
POST   /api/spaces/{id}/leave           → Leave space
PUT    /api/spaces/{id}                 → Update space (moderator only)
```

### Threads
```
POST   /api/spaces/{id}/threads         → Create thread
GET    /api/threads/{id}                → Get thread with comments
PUT    /api/threads/{id}                → Update thread (author only)
DELETE /api/threads/{id}                → Delete thread
POST   /api/threads/{id}/pin            → Pin thread (moderator only)
```

### Comments
```
POST   /api/threads/{id}/comments       → Add comment
PUT    /api/comments/{id}               → Update comment
DELETE /api/comments/{id}               → Delete comment
GET    /api/comments/{id}/replies       → Get replies
```

### Voting
```
POST   /api/threads/{id}/vote           → Vote on thread
POST   /api/comments/{id}/vote          → Vote on comment
```

### Moderation
```
POST   /api/reports                     → Report content
GET    /api/reports                     → Get reports (moderator)
PUT    /api/reports/{id}/resolve        → Resolve report
```

## Frontend Components (To Be Created)

### Pages
- `SpacesPage.jsx` - Grid of all spaces
- `SpaceDetailPage.jsx` - Space with thread list
- `ThreadPage.jsx` - Thread with nested comments
- `ModerationPanel.jsx` - Moderator dashboard

### Components
- `VoteButton.jsx` - Upvote/downvote
- `TagChip.jsx` - Tag display
- `FilterBar.jsx` - Sort/filter threads
- `PostEditor.jsx` - Create/edit posts
- `CommentThread.jsx` - Nested comments

### Services
- `spaceService.js` - API calls for spaces
- `threadService.js` - API calls for threads
- `commentService.js` - API calls for comments
- `voteService.js` - API calls for voting

## Next Steps

1. Implement Services (SpaceService, ThreadService, etc.)
2. Implement Controllers with security
3. Create frontend services
4. Create frontend components
5. Create frontend pages
6. Add routes and navigation

## Database Indexes

Already configured in models:
- Space: name index
- Thread: (spaceId, createdAt), (spaceId, voteScore)
- ThreadComment: (threadId, createdAt), (threadId, parentCommentId, createdAt)
- Vote: (userId, targetId, targetType) unique, (targetId, targetType)
- Report: (status, createdAt), (reporterId, targetId)

## Features Implemented

✅ Complete MongoDB schema with indexes
✅ Repository layer with custom queries
✅ DTOs for API communication
⏳ Service layer (in progress)
⏳ Controller layer (in progress)
⏳ Frontend implementation (in progress)
