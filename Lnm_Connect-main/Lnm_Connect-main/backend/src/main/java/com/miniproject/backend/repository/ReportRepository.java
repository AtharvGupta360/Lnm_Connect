package com.miniproject.backend.repository;

import com.miniproject.backend.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Report entity
 */
@Repository
public interface ReportRepository extends MongoRepository<Report, String> {
    
    /**
     * Find reports by status with pagination
     */
    Page<Report> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    
    /**
     * Find all pending reports
     */
    List<Report> findByStatusOrderByCreatedAtDesc(String status);
    
    /**
     * Find reports by target
     */
    List<Report> findByTargetIdAndTargetType(String targetId, String targetType);
    
    /**
     * Find reports by reporter
     */
    List<Report> findByReporterIdOrderByCreatedAtDesc(String reporterId);
    
    /**
     * Count pending reports
     */
    long countByStatus(String status);
    
    /**
     * Check if user has already reported a target
     */
    boolean existsByReporterIdAndTargetIdAndTargetType(String reporterId, String targetId, String targetType);
}
