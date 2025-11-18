# User Link Implementation Guide

## Overview
This document outlines the implementation of consistent "navigate to user profile" interaction across the entire LNMConnect application.

## ✅ Completed
1. **Created UserLink Component** (`frontend/src/components/UserLink.jsx`)
   - Reusable wrapper component for clickable user elements
   - Keyboard accessible (Enter/Space)
   - Proper ARIA labels
   - Visual feedback (hover/focus states)
   - Event bubbling prevention
   - Helper function `navigateToUserProfile()` for programmatic navigation

## 🎯 Components That Need Updates

### High Priority (User-Facing Content)
1. **App.jsx - Post Feed**
   - Post author names
   - Post author avatars
   - Apply/Reject buttons with user context

2. **ProfilePage.jsx**
   - Post author names in Posts/Projects/Achievements sections
   - User avatar clicks

3. **Post Components**
   - PostDetailPage.jsx - Post author
   - Comments section - Comment authors

4. **Discussion Forum**
   - Discussion author names
   - Reply author names
   - DiscussionDetailPage.jsx

5. **Messaging**
   - Chat list user names/avatars
   - Message sender names/avatars
   - MessageButton.jsx (if it displays user info)

### Medium Priority (Sidebar/Navigation)
6. **ProfileSidebar.jsx**
   - User profile card (own profile)
   - Connection list items

7. **Notifications**
   - Notification sender names
   - NotificationBell.jsx items

8. **Search Results**
   - User search result items
   - SearchBar.jsx results

### Lower Priority (Specialized Features)
9. **Voice Channel**
   - VoiceChannelModal.jsx - Participant names/avatars
   - CreateVoiceChannelModal.jsx - User list

10. **Follow System**
    - FollowButton.jsx (if it shows user info)
    - Connection/Follow list items

11. **My Network Page**
    - Connection cards
    - Pending requests
    - Suggested connections

## 📋 Implementation Pattern

### For Each Component:
```jsx
// 1. Import UserLink at the top
import UserLink from './components/UserLink';

// 2. Wrap user name
<UserLink userId={post.authorId} userName={post.authorName}>
  <span className="font-medium">{post.authorName}</span>
</UserLink>

// 3. Wrap user avatar
<UserLink userId={user.id} userName={user.name}>
  <img 
    src={user.photoUrl} 
    alt={user.name}
    className="w-10 h-10 rounded-full"
  />
</UserLink>

// 4. For programmatic navigation (in event handlers)
import { navigateToUserProfile } from './components/UserLink';
const navigate = useNavigate();

const handleUserClick = () => {
  navigateToUserProfile(userId, navigate);
};
```

## 🔍 Key Considerations

### 1. UserId Resolution
- Ensure all API responses include `userId` or `id`
- Update backend if needed to always return user IDs
- Common field names: `authorId`, `userId`, `senderId`, `creatorId`, `id`

### 2. Self-Profile Handling
- Don't make current user's own name/avatar clickable (redundant)
- Or make it navigate to `/profile` (without ID) for own profile
- Check: `userId !== currentUser.id`

### 3. Event Handling
- UserLink prevents bubbling by default
- Safe to use in clickable parent elements (post cards, etc.)
- Remove existing `onClick` handlers from user elements

### 4. Accessibility
- UserLink adds proper roles and aria-labels
- Keyboard navigation built-in
- Focus states visible

### 5. Styling
- UserLink is display: inline-flex by default
- Adds cursor:pointer automatically
- Preserves child styling
- Adds focus ring (customizable)

## 🚀 Implementation Steps

### Phase 1: Core Content (Priority)
1. Update App.jsx post feed
2. Update ProfilePage.jsx
3. Update Post/Comment components
4. Update Discussion forum
5. Test navigation flow

### Phase 2: Messaging & Notifications
1. Update chat components
2. Update notification items
3. Update search results
4. Test all messaging flows

### Phase 3: Network & Specialized
1. Update My Network page
2. Update voice channel modals
3. Update follow/connection lists
4. Final testing across all features

## 📝 Testing Checklist

For each updated component:
- [ ] Clicking user name navigates to profile
- [ ] Clicking user avatar navigates to profile
- [ ] Enter key navigates when focused
- [ ] Space key navigates when focused
- [ ] Focus ring visible on keyboard navigation
- [ ] Hover state shows clickability
- [ ] Navigation doesn't trigger parent click handlers
- [ ] Screen reader announces "View [user]'s profile"
- [ ] Own profile elements either disabled or work correctly

## 🔄 Migration Example

### Before:
```jsx
<div className="flex items-center gap-2">
  <img src={user.photoUrl} className="w-10 h-10 rounded-full" />
  <span className="font-medium">{user.name}</span>
</div>
```

### After:
```jsx
<div className="flex items-center gap-2">
  <UserLink userId={user.id} userName={user.name}>
    <img src={user.photoUrl} className="w-10 h-10 rounded-full" />
  </UserLink>
  <UserLink userId={user.id} userName={user.name}>
    <span className="font-medium">{user.name}</span>
  </UserLink>
</div>
```

## 📦 Next Steps

1. Review this guide
2. Decide on implementation priority
3. Update components phase by phase
4. Test thoroughly after each phase
5. Update this document as you go
6. Mark completed items with ✅

## 🐛 Common Issues & Solutions

### Issue: "userId is undefined"
**Solution**: Check API response, ensure backend returns user ID. Use fallback: `userId={user.id || user._id || user.userId}`

### Issue: "Navigation happens twice"
**Solution**: Remove old onClick handlers from parent elements or the user element itself.

### Issue: "Styling broken"
**Solution**: UserLink is inline-flex. For block layout, wrap in div or add `display: block` to className.

### Issue: "Focus outline too prominent"
**Solution**: Customize focus ring: `className="focus:ring-blue-400 focus:ring-offset-2"`

---

**Status**: UserLink component created ✅  
**Next Action**: Begin Phase 1 implementation (Core Content)
