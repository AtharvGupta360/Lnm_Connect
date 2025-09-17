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
    private String name;
    private String userId; // author id
    private String description;

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
