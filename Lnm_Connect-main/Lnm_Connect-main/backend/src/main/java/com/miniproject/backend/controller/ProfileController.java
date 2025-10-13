package com.miniproject.backend.controller;

import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {
    @Autowired
    private UserRepository userRepository;

    // Get current user's profile
    @GetMapping("/me")
    public User getMyProfile(@RequestParam String userId) {
        return userRepository.findById(userId).orElse(null);
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
