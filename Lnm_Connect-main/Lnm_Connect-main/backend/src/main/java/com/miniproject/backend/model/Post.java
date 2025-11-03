package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Document(collection = "posts")
public class Post {
    @JsonProperty("isApplyEnabled")
    private boolean isApplyEnabled = false;
    private java.util.List<String> applicationIds = new java.util.ArrayList<>();
    private Long applicationDeadline; // Unix timestamp in milliseconds
    @Id
    private String id;
    private String title;
    private List<String> tags;
    private String body;
    private String image;
    private String authorId;
    private String authorName;
    private java.util.List<String> taggedUserIds;
    private java.util.List<String> taggedClubIds;
    private java.util.Set<String> likes = new java.util.HashSet<>();
    private java.util.List<Comment> comments;
    private long createdAt;
    public java.util.List<String> getTaggedUserIds() { return taggedUserIds; }
    public void setTaggedUserIds(java.util.List<String> taggedUserIds) { this.taggedUserIds = taggedUserIds; }
    public java.util.List<String> getTaggedClubIds() { return taggedClubIds; }
    public void setTaggedClubIds(java.util.List<String> taggedClubIds) { this.taggedClubIds = taggedClubIds; }
    public java.util.Set<String> getLikes() { return likes; }
    public void setLikes(java.util.Set<String> likes) { this.likes = likes; }
    public java.util.List<Comment> getComments() { return comments; }
    public void setComments(java.util.List<Comment> comments) { this.comments = comments; }

    public boolean isApplyEnabled() { return isApplyEnabled; }
    public void setApplyEnabled(boolean applyEnabled) { isApplyEnabled = applyEnabled; }
    public java.util.List<String> getApplicationIds() { return applicationIds == null ? new java.util.ArrayList<>() : applicationIds; }
    public void setApplicationIds(java.util.List<String> applicationIds) { this.applicationIds = applicationIds; }
    public Long getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(Long applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public Post() {
        this.createdAt = System.currentTimeMillis();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}
