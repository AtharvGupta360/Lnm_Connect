package com.miniproject.backend.controller;

import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public User signup(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("User already exists");
        }
        // Defensive: ensure all fields are initialized
        if (user.getSkills() == null) user.setSkills(new java.util.ArrayList<>());
        if (user.getInterests() == null) user.setInterests(new java.util.ArrayList<>());
        if (user.getGithubProfile() == null) user.setGithubProfile("");
        if (user.getPortfolio() == null) user.setPortfolio("");
        if (user.getBio() == null) user.setBio("");
        if (user.getEducation() == null) user.setEducation("");
        if (user.getBranchYear() == null) user.setBranchYear("");
        if (user.getContact() == null) user.setContact("");
        if (user.getPhotoUrl() == null) user.setPhotoUrl("");
        User savedUser = userRepository.save(user);
        System.out.println("[INFO] User signed up: " + user.getEmail());
        return savedUser;
    }

    @PostMapping("/login")
    public User login(@RequestBody User user) {
        User existing = userRepository.findByEmail(user.getEmail());
        if (existing != null && existing.getPassword().equals(user.getPassword())) {
            System.out.println("[INFO] User logged in: " + user.getEmail());
            return existing;
        }
        throw new RuntimeException("Invalid credentials");
    }

    @GetMapping("/test")
    public String test() {
        return "Backend is running!";
    }

    // Get user by id
    @GetMapping("/user/{id}")
    public User getUserById(@PathVariable String id) {
        return userRepository.findById(id).orElse(null);
    }

    // Update user details after signup (skills, interests, githubProfile, portfolio)
    @PutMapping("/user/{id}")
    public User updateUserDetails(@PathVariable String id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setSkills(userDetails.getSkills());
            user.setInterests(userDetails.getInterests());
            user.setGithubProfile(userDetails.getGithubProfile());
            user.setPortfolio(userDetails.getPortfolio());
            return userRepository.save(user);
        }).orElse(null);
    }

    // Get all users (for browsing profiles)
    @GetMapping("/users")
    public java.util.List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
