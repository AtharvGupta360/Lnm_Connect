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
}
