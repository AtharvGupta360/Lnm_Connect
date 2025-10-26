package com.miniproject.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String password;

    private java.util.List<String> skills;
    private java.util.List<String> interests;
    private String githubProfile;
    private String portfolio;
    private String bio;
    private String education;
    private String branchYear;
    private String contact;
    private String photoUrl;
    
    // Recommendation fields
    private java.util.List<String> techStack;
    private java.util.List<String> learningGoals;
    private String experienceLevel; // beginner, intermediate, advanced
    private java.util.List<String> collaborationHistory; // List of user IDs
    private java.util.List<String> joinedClubs; // List of club IDs
    private java.util.List<String> followingUsers; // List of user IDs

    public User() {}

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    public String getBranchYear() { return branchYear; }
    public void setBranchYear(String branchYear) { this.branchYear = branchYear; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public java.util.List<String> getSkills() { return skills; }
    public void setSkills(java.util.List<String> skills) { this.skills = skills; }
    public java.util.List<String> getInterests() { return interests; }
    public void setInterests(java.util.List<String> interests) { this.interests = interests; }
    public String getGithubProfile() { return githubProfile; }
    public void setGithubProfile(String githubProfile) { this.githubProfile = githubProfile; }
    public String getPortfolio() { return portfolio; }
    public void setPortfolio(String portfolio) { this.portfolio = portfolio; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    // Recommendation field getters and setters
    public java.util.List<String> getTechStack() { return techStack; }
    public void setTechStack(java.util.List<String> techStack) { this.techStack = techStack; }
    public java.util.List<String> getLearningGoals() { return learningGoals; }
    public void setLearningGoals(java.util.List<String> learningGoals) { this.learningGoals = learningGoals; }
    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public java.util.List<String> getCollaborationHistory() { return collaborationHistory; }
    public void setCollaborationHistory(java.util.List<String> collaborationHistory) { this.collaborationHistory = collaborationHistory; }
    public java.util.List<String> getJoinedClubs() { return joinedClubs; }
    public void setJoinedClubs(java.util.List<String> joinedClubs) { this.joinedClubs = joinedClubs; }
    public java.util.List<String> getFollowingUsers() { return followingUsers; }
    public void setFollowingUsers(java.util.List<String> followingUsers) { this.followingUsers = followingUsers; }
}
