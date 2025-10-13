package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "certificates")
public class Certificate {
    @Id
    private String id;
    private String userId;
    private String title;
    private String organization;
    private String date;
    private String fileUrl;

    public Certificate() {}

    public Certificate(String userId, String title, String organization, String date, String fileUrl) {
        this.userId = userId;
        this.title = title;
        this.organization = organization;
        this.date = date;
        this.fileUrl = fileUrl;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}
