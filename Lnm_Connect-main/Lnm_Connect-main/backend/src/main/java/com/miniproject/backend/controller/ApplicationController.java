package com.miniproject.backend.controller;

import com.miniproject.backend.model.Application;
import com.miniproject.backend.dto.ApplicantDTO;
import com.miniproject.backend.service.ApplicationService;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class ApplicationController {
    @Autowired
    private ApplicationService applicationService;

    // POST /posts/{postId}/apply
    @PostMapping("/{postId}/apply")
    public Map<String, Object> applyToPost(@PathVariable String postId, @RequestParam String userId) {
        Application app = applicationService.applyToPost(userId, postId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Applied successfully");
        resp.put("applicationId", app.getId());
        return resp;
    }

    // GET /posts/{postId}/applicants
    @GetMapping("/{postId}/applicants")
    public List<ApplicantDTO> getApplicants(@PathVariable String postId, @RequestParam String ownerId) {
        return applicationService.getApplicantsForPost(postId, ownerId);
    }

    // PUT /posts/applications/{applicationId}/accept
    @PutMapping("/applications/{applicationId}/accept")
    public Map<String, Object> acceptApplication(@PathVariable String applicationId, @RequestParam String ownerId) {
        Application app = applicationService.acceptApplication(applicationId, ownerId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Application accepted");
        resp.put("status", app.getStatus().toString());
        return resp;
    }

    // PUT /posts/applications/{applicationId}/reject
    @PutMapping("/applications/{applicationId}/reject")
    public Map<String, Object> rejectApplication(@PathVariable String applicationId, @RequestParam String ownerId) {
        Application app = applicationService.rejectApplication(applicationId, ownerId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Application rejected");
        resp.put("status", app.getStatus().toString());
        return resp;
    }
}
