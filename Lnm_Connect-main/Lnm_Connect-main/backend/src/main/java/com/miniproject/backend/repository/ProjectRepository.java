package com.miniproject.backend.repository;

import com.miniproject.backend.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {
    
    // Find active projects
    List<Project> findByIsActiveTrue();
    
    // Find projects by status
    List<Project> findByStatusAndIsActiveTrue(String status);
    
    // Find projects by owner
    List<Project> findByOwnerIdAndIsActiveTrue(String ownerId);
    
    // Find projects by domain
    List<Project> findByDomainAndIsActiveTrueOrderByCreatedAtDesc(String domain);
    
    // Find projects that are recruiting
    @Query("{'status': 'recruiting', 'isActive': true, 'currentTeamMembers': {$lt: '$teamSize'}}")
    List<Project> findRecruitingProjects();
    
    // Find projects by required skills (contains any of the skills)
    @Query("{'requiredSkills': {$in: ?0}, 'isActive': true}")
    List<Project> findByRequiredSkillsIn(List<String> skills);
}
