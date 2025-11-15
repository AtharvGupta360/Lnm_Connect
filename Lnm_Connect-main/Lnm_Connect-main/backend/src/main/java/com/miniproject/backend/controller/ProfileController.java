package com.miniproject.backend.controller;

import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {
    @Autowired
    private UserRepository userRepository;

    // Get current user's profile
    @GetMapping("/me")
    public User getMyProfile(@RequestParam String userId) {
        return userRepository.findById(userId).orElse(null);
    }

    // Get any user's profile by ID
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching profile: " + e.getMessage());
        }
    }

    // Update profile info (name, bio, education, branchYear, contact, photoUrl, etc.)
    @PutMapping("/me")
    public User updateMyProfile(@RequestParam String userId, @RequestBody User userDetails) {
        return userRepository.findById(userId).map(user -> {
            user.setName(userDetails.getName());
            user.setBio(userDetails.getBio());
            user.setEducation(userDetails.getEducation());
            user.setBranchYear(userDetails.getBranchYear());
            user.setContact(userDetails.getContact());
            user.setPhotoUrl(userDetails.getPhotoUrl());
            user.setSkills(userDetails.getSkills());
            user.setInterests(userDetails.getInterests());
            return userRepository.save(user);
        }).orElse(null);
    }
}
