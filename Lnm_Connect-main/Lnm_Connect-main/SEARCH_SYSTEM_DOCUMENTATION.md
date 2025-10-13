# Global Search System Documentation

## 🔍 Overview

A professional, LinkedIn-style global search system that enables users to search across Profiles, Posts, and Opportunities with real-time autocomplete suggestions and categorized results.

## ✨ Features

### 1. **Global Search Bar**
- Always visible in the top navigation bar
- Real-time autocomplete suggestions as you type
- 350ms debouncing to optimize API calls
- Intelligent dropdown with categorized results
- Mobile-responsive design

### 2. **Backend Search API**
- Single unified endpoint: `/api/search?q={query}`
- Case-insensitive search across multiple entities
- Caching support with `@Cacheable`
- Quick search endpoint for autocomplete: `/api/search/quick?q={query}`

### 3. **Search Categories**
- **Profiles**: Search by name, skills, interests, education, branch/year, bio
- **Posts**: Search by title, content, tags, author name
- **Opportunities/Projects**: Search posts with project-related tags

### 4. **Search Results Page**
- Dedicated page at `/search?q={query}`
- Tabbed interface: All | Profiles | Posts | Opportunities
- Professional card layouts for each category
- Smooth animations and transitions
- Result counts displayed on tabs

## 📁 File Structure

### Backend Files

```
backend/src/main/java/com/miniproject/backend/
├── dto/
│   ├── SearchResultDTO.java       # Individual search result structure
│   └── SearchResponseDTO.java     # Complete search response
├── service/
│   └── SearchService.java         # Search business logic
└── controller/
    └── SearchController.java      # REST API endpoints
```

### Frontend Files

```
frontend/src/
├── components/
│   └── SearchBar.jsx              # Reusable search bar with autocomplete
└── pages/
    └── SearchResultsPage.jsx      # Full search results page
```

## 🔧 Backend Implementation

### 1. SearchResultDTO.java
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {
    private String id;
    private String type; // "profile", "post", "project"
    private String title;
    private String subtitle;
    private String snippet;
    private String imageUrl;
    private List<String> tags;
    private String authorId;
    private String authorName;
    private Object additionalData;
}
```

### 2. SearchResponseDTO.java
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponseDTO {
    private List<SearchResultDTO> profiles;
    private List<SearchResultDTO> posts;
    private List<SearchResultDTO> projects;
    private int totalResults;
    private String query;
}
```

### 3. SearchService.java
Key methods:
- `globalSearch(String query, int limit)` - Main search logic
- `searchUsers(String query, int limit)` - Search user profiles
- `searchPosts(String query, int limit)` - Search posts
- `searchProjects(String query, int limit)` - Search opportunities

**Search Fields:**
- Users: name, email, education, branchYear, bio, skills, interests
- Posts: title, body, tags, authorName
- Projects: Same as posts, filtered by project-related tags

### 4. SearchController.java
**Endpoints:**

```java
// Main search endpoint
GET /api/search?q={query}&limit={limit}

// Quick search for autocomplete
GET /api/search/quick?q={query}
```

**Response Example:**
```json
{
  "profiles": [
    {
      "id": "user123",
      "type": "profile",
      "title": "Atharv Gupta",
      "subtitle": "LNMIIT • Computer Science",
      "snippet": "Skills: Java, React, Spring Boot",
      "imageUrl": "https://ui-avatars.com/api/?name=A...",
      "tags": ["Java", "React", "Spring Boot"],
      "authorId": "user123",
      "authorName": "Atharv Gupta"
    }
  ],
  "posts": [...],
  "projects": [...],
  "totalResults": 15,
  "query": "developer"
}
```

## 🎨 Frontend Implementation

### 1. SearchBar Component

**Features:**
- Debounced search (350ms)
- Real-time autocomplete dropdown
- Click-outside to close
- Loading spinner
- Clear button
- Categorized results preview (max 3 per category)
- "View all results" button

**Props:**
- `isCompact` (boolean): For mobile responsive design

**Usage:**
```jsx
import SearchBar from './components/SearchBar';

<SearchBar />
<SearchBar isCompact /> // for mobile
```

### 2. SearchResultsPage Component

**Features:**
- Tab-based navigation (All, Profiles, Posts, Opportunities)
- Result count badges on tabs
- Animated tab transitions
- Three specialized card types:
  - ProfileCard: Avatar, name, skills, "View Profile" + "Message" buttons
  - PostCard: Post icon, title, author, snippet, tags
  - ProjectCard: Opportunity badge, gradient background, "Apply Now" button

**Responsive Design:**
- Desktop: Side-by-side layout with full content
- Mobile: Stacked cards with condensed information

## 🎯 Usage Examples

### Basic Search Flow

1. **User types in search bar**
   ```
   User types: "java developer"
   → Triggers after 350ms
   → Calls: /api/search/quick?q=java%20developer
   → Shows dropdown with top 3 results per category
   ```

2. **User clicks "View all results"**
   ```
   → Navigates to: /search?q=java%20developer
   → Calls: /api/search?q=java%20developer&limit=20
   → Shows full results page with tabs
   ```

3. **User clicks on a result**
   ```
   Profile → Navigates to /profile/{userId}
   Post → Navigates to /?postId={postId}
   Project → Navigates to /?postId={postId}
   ```

### Integration in App.jsx

```jsx
import SearchBar from './components/SearchBar';
import SearchResultsPage from './pages/SearchResultsPage';

// In HeaderNav component
<div className="hidden md:block flex-1 max-w-2xl">
  <SearchBar />
</div>

// Add route
<Route path="/search" element={<SearchResultsPage />} />
```

## 🚀 API Testing

### Test Endpoints with curl

```bash
# Basic search
curl "http://localhost:8080/api/search?q=java"

# Search with limit
curl "http://localhost:8080/api/search?q=developer&limit=10"

# Quick search (autocomplete)
curl "http://localhost:8080/api/search/quick?q=java"
```

### Expected Response Times
- Quick search: < 200ms
- Full search: < 500ms
- Cached results: < 50ms

## 🎨 Styling & Design

### Color Scheme
- Primary: Indigo (600-700)
- Secondary: Purple (600-700)
- Accent: Pink (500-600) for opportunities
- Success: Green (100-700) for active badges
- Neutral: Gray scale

### Animations
- Dropdown: fade + slide animation (200ms)
- Tab switching: fade animation (300ms)
- Cards: scale + opacity on mount
- Hover effects: lift + shadow enhancement

### Responsive Breakpoints
- Mobile: < 768px (md)
- Tablet: 768px - 1024px (md-lg)
- Desktop: > 1024px (lg+)

## 🔐 Security Considerations

1. **Input Sanitization**: All search queries are trimmed and encoded
2. **CORS**: Configured to accept requests from frontend origin
3. **Rate Limiting**: Consider adding rate limiting for production
4. **SQL Injection**: Using parameterized queries (MongoDB safe by default)

## 📊 Performance Optimization

### Backend
- `@Cacheable` annotation on search methods
- Stream API for efficient filtering
- Limit results to prevent large payloads
- Future: Add Elasticsearch for better full-text search

### Frontend
- Debouncing to reduce API calls
- useRef to prevent unnecessary re-renders
- AnimatePresence for smooth exit animations
- Lazy loading for search results page

## 🐛 Troubleshooting

### Common Issues

1. **Search not working**
   - Check backend is running on port 8080
   - Verify CORS configuration in backend
   - Check browser console for errors

2. **Empty results**
   - Ensure database has data
   - Check search query length (minimum 2 characters)
   - Verify search service is matching correctly

3. **Dropdown not showing**
   - Check if query length >= 2
   - Verify API response is successful
   - Check z-index for dropdown (should be 50)

## 🔄 Future Enhancements

1. **Advanced Filters**
   - Filter by date range
   - Filter by specific tags
   - Sort options (relevance, date, popularity)

2. **Search History**
   - Store recent searches
   - Quick access to previous queries

3. **Search Analytics**
   - Track popular searches
   - Improve relevance algorithm

4. **Elasticsearch Integration**
   - Better full-text search
   - Fuzzy matching
   - Highlighting matched terms

5. **Voice Search**
   - Speech-to-text integration

## 📝 Testing Checklist

- [ ] Backend endpoints return correct data
- [ ] Search works for all categories
- [ ] Debouncing prevents excessive API calls
- [ ] Dropdown closes on outside click
- [ ] Navigation works from dropdown
- [ ] Search results page displays all categories
- [ ] Tabs switch correctly
- [ ] Mobile responsive design works
- [ ] Loading states display correctly
- [ ] Empty states show appropriate messages

## 📚 Dependencies

### Backend
- Spring Boot 3.x
- Spring Data MongoDB
- Lombok
- Spring Cache

### Frontend
- React 18+
- React Router DOM 6+
- Framer Motion
- Lucide React (icons)
- Tailwind CSS

## 👨‍💻 Development Tips

1. **Backend Development**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Testing Search**
   - Add sample data to database
   - Test with various query lengths
   - Test special characters handling
   - Test with empty results

## 🎉 Success Criteria

✅ Search bar visible in navigation
✅ Real-time autocomplete working
✅ Categorized results displayed
✅ Full search results page functional
✅ Mobile responsive
✅ Professional UI/UX
✅ Fast response times (< 500ms)
✅ Smooth animations
✅ Error handling implemented

---

**Version**: 1.0  
**Last Updated**: October 14, 2025  
**Author**: LNMConnect Development Team
