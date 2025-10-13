package com.miniproject.backend.dto;

import java.util.Date;

public class ApplicantDTO {
    private String id;
    private String name;
    private String email;
    private Date dateApplied;
    // Add more profile fields as needed

    public ApplicantDTO(String id, String name, String email, Date dateApplied) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.dateApplied = dateApplied;
    }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Date getDateApplied() { return dateApplied; }
    public void setDateApplied(Date dateApplied) { this.dateApplied = dateApplied; }
}