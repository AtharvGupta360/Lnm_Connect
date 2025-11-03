package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document(collection = "campus_buzz")
public class CampusBuzz {
    @Id
    private String id;
    private String title;
    private String description;
    private String category; // PLACEMENT, CULTURAL, TECHNICAL, SPORTS, ANNOUNCEMENT, FEST, WORKSHOP
    private String imageUrl;
    private String link; // External link for more details
    private long eventDate; // Timestamp for event date
    private long createdAt;
    private String authorId;
    private String authorName;
    private Set<String> likes = new HashSet<>();
    private List<Comment> comments = new ArrayList<>();
    private boolean isPinned; // Pinned announcements appear first
    private String venue;
    private int priority; // 1-5, higher priority shown first

    public CampusBuzz() {
        this.createdAt = System.currentTimeMillis();
        this.priority = 3; // Default medium priority
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getLink() { return link; }
    public void setLink(String link) { this.link = link; }

    public long getEventDate() { return eventDate; }
    public void setEventDate(long eventDate) { this.eventDate = eventDate; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public Set<String> getLikes() { return likes; }
    public void setLikes(Set<String> likes) { this.likes = likes; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public boolean isPinned() { return isPinned; }
    public void setPinned(boolean pinned) { isPinned = pinned; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
}
