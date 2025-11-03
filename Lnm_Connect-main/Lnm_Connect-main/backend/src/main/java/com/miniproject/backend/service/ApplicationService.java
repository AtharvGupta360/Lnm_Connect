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
import com.miniproject.backend.dto.SendMessageRequest;

@Service
public class ApplicationService {
    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ChatService chatService;

    public Application applyToPost(String userId, String postId) {
        if (userId == null || userId.isEmpty()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (!post.isApplyEnabled()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Applications not enabled for this post");
        
        // Check if application deadline has passed
        if (post.getApplicationDeadline() != null && System.currentTimeMillis() > post.getApplicationDeadline()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "⏰ The application deadline for this opportunity has passed. Applications are no longer being accepted.");
        }
        
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
                applicants.add(new ApplicantDTO(
                    user.getId(), 
                    user.getName(), 
                    user.getEmail(), 
                    app.getDateApplied(),
                    app.getStatus().toString(),
                    app.getId()
                ));
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
            
            // Check if deadline has passed
            boolean deadlinePassed = post.getApplicationDeadline() != null && 
                                    System.currentTimeMillis() > post.getApplicationDeadline();
            
            canApply = (currentUserId != null && !currentUserId.isEmpty()) && 
                      !hasApplied && 
                      !post.getAuthorId().equals(currentUserId) &&
                      !deadlinePassed;
            
            if (post.getAuthorId().equals(currentUserId)) {
                applicants = getApplicantsForPost(post.getId(), currentUserId);
            }
        }
        return new PostResponseDTO(post, canApply, hasApplied, applicants);
    }

    public Application acceptApplication(String applicationId, String ownerId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        
        Post post = postRepository.findById(application.getPostId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!post.getAuthorId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to accept this application");
        }

        application.setStatus(Application.ApplicationStatus.ACCEPTED);
        applicationRepository.save(application);

        // Send notification to applicant via chat
        User applicant = userRepository.findById(application.getUserId()).orElse(null);
        if (applicant != null) {
            String message = String.format("🎉 Congratulations! Your application for '%s' has been ACCEPTED!", 
                    post.getTitle() != null ? post.getTitle() : "the post");
            
            SendMessageRequest messageRequest = new SendMessageRequest();
            messageRequest.setReceiverId(application.getUserId());
            messageRequest.setContent(message);
            
            try {
                chatService.sendMessage(ownerId, messageRequest);
            } catch (Exception e) {
                System.err.println("Failed to send acceptance notification: " + e.getMessage());
            }
        }

        return application;
    }

    public Application rejectApplication(String applicationId, String ownerId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));
        
        Post post = postRepository.findById(application.getPostId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        
        if (!post.getAuthorId().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to reject this application");
        }

        application.setStatus(Application.ApplicationStatus.REJECTED);
        applicationRepository.save(application);

        // Send notification to applicant via chat
        User applicant = userRepository.findById(application.getUserId()).orElse(null);
        if (applicant != null) {
            String message = String.format("Thank you for your interest in '%s'. Unfortunately, we've decided to move forward with other candidates at this time.", 
                    post.getTitle() != null ? post.getTitle() : "the post");
            
            SendMessageRequest messageRequest = new SendMessageRequest();
            messageRequest.setReceiverId(application.getUserId());
            messageRequest.setContent(message);
            
            try {
                chatService.sendMessage(ownerId, messageRequest);
            } catch (Exception e) {
                System.err.println("Failed to send rejection notification: " + e.getMessage());
            }
        }

        return application;
    }
}
