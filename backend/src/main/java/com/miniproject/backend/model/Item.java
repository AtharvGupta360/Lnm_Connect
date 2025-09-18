package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Document(collection = "items")
public class Item {
    @Id
    private String id;

    // Unified post fields
    private String name; // legacy, can be used as fallback for authorName
    private String userId; // author id
    private String description; // legacy, can be used as fallback for body

    // New post fields
    private String title;
    private List<String> tags;
    private String body;
    private String image;
    private String authorName;
    private List<String> taggedUserIds;
    private List<String> taggedClubIds;

    private Set<String> likes = new HashSet<>(); // userIds who liked
    private List<Comment> comments;

    private long createdAt;

    public Item() {
        this.createdAt = System.currentTimeMillis();
    }

    public Item(String name, String description, String userId) {
        this.name = name;
        this.description = description;
        this.userId = userId;
        this.createdAt = System.currentTimeMillis();
    }

    // New unified post fields
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public List<String> getTaggedUserIds() { return taggedUserIds; }
    public void setTaggedUserIds(List<String> taggedUserIds) { this.taggedUserIds = taggedUserIds; }

    public List<String> getTaggedClubIds() { return taggedClubIds; }
    public void setTaggedClubIds(List<String> taggedClubIds) { this.taggedClubIds = taggedClubIds; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Set<String> getLikes() { return likes; }
    public void setLikes(Set<String> likes) { this.likes = likes; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }
}
