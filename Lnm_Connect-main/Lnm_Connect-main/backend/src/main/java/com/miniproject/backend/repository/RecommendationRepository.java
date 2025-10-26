package com.miniproject.backend.repository;

import com.miniproject.backend.model.Recommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface RecommendationRepository extends MongoRepository<Recommendation, String> {
    
    // Find all recommendations for a user by type
    List<Recommendation> findByUserIdAndTargetTypeOrderBySimilarityScoreDesc(String userId, String targetType);
    
    // Find a specific recommendation
    Recommendation findByUserIdAndTargetTypeAndTargetId(String userId, String targetType, String targetId);
    
    // Delete all recommendations for a user
    void deleteByUserId(String userId);
    
    // Delete recommendations by type
    void deleteByUserIdAndTargetType(String userId, String targetType);
    
    // Get top N recommendations
    @Query(value = "{'userId': ?0, 'targetType': ?1}", sort = "{'similarityScore': -1}")
    List<Recommendation> findTopRecommendations(String userId, String targetType);
}
