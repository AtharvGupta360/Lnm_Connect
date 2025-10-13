package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "applications")
public class Application {
    @Id
    private String id;
    private String userId;
    private String postId;
    private Date dateApplied;

    public Application() {}
    public Application(String userId, String postId) {
        this.userId = userId;
        this.postId = postId;
        this.dateApplied = new Date();
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }
    public Date getDateApplied() { return dateApplied; }
    public void setDateApplied(Date dateApplied) { this.dateApplied = dateApplied; }
}
