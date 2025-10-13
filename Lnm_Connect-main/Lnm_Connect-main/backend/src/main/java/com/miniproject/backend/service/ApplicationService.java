package com.miniproject.backend.service;

import com.miniproject.backend.model.Application;
import com.miniproject.backend.model.Post;
import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.ApplicationRepository;
import com.miniproject.backend.repository.PostRepository;
import com.miniproject.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.miniproject.backend.dto.ApplicantDTO;
import com.miniproject.backend.dto.PostResponseDTO;

@Service
public class ApplicationService {
    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;

    public Application applyToPost(String userId, String postId) {
        if (userId == null || userId.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (!post.isApplyEnabled()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Applications not enabled for this post");
        if (applicationRepository.existsByUserIdAndPostId(userId, postId))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already applied to this post");

        Application app = new Application(userId, postId);
        app = applicationRepository.save(app);

        List<String> appIds = post.getApplicationIds() == null ? new ArrayList<>() : post.getApplicationIds();
        appIds.add(app.getId());
        post.setApplicationIds(appIds);
        postRepository.save(post);

        return app;
    }

    public List<ApplicantDTO> getApplicantsForPost(String postId, String ownerId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (!post.getAuthorId().equals(ownerId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view applicants");
        List<Application> apps = applicationRepository.findByPostId(postId);
        List<ApplicantDTO> applicants = new ArrayList<>();
        for (Application app : apps) {
            userRepository.findById(app.getUserId()).ifPresent(user -> {
                applicants.add(new ApplicantDTO(user.getId(), user.getName(), user.getEmail(), app.getDateApplied()));
            });
        }
        return applicants;
    }

    public boolean hasUserApplied(String userId, String postId) {
        return applicationRepository.existsByUserIdAndPostId(userId, postId);
    }

    public PostResponseDTO getPostWithApplyInfo(Post post, String currentUserId) {
        boolean hasApplied = false;
        boolean canApply = false;
        List<ApplicantDTO> applicants = null;
        if (post.isApplyEnabled()) {
            hasApplied = (currentUserId != null && !currentUserId.isEmpty()) && hasUserApplied(currentUserId, post.getId());
            canApply = (currentUserId != null && !currentUserId.isEmpty()) && !hasApplied && !post.getAuthorId().equals(currentUserId);
            if (post.getAuthorId().equals(currentUserId)) {
                applicants = getApplicantsForPost(post.getId(), currentUserId);
            }
        }
        return new PostResponseDTO(post, canApply, hasApplied, applicants);
    }
}
