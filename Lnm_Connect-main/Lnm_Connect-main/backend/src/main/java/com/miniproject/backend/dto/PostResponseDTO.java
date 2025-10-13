package com.miniproject.backend.dto;

import com.miniproject.backend.model.Post;
import java.util.List;

public class PostResponseDTO {
    private Post post;
    private boolean canApply;
    private boolean hasApplied;
    private List<ApplicantDTO> applicants;

    public PostResponseDTO(Post post, boolean canApply, boolean hasApplied, List<ApplicantDTO> applicants) {
        this.post = post;
        this.canApply = canApply;
        this.hasApplied = hasApplied;
        this.applicants = applicants;
    }
    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
    public boolean isCanApply() { return canApply; }
    public void setCanApply(boolean canApply) { this.canApply = canApply; }
    public boolean isHasApplied() { return hasApplied; }
    public void setHasApplied(boolean hasApplied) { this.hasApplied = hasApplied; }
    public List<ApplicantDTO> getApplicants() { return applicants; }
    public void setApplicants(List<ApplicantDTO> applicants) { this.applicants = applicants; }
}