package com.miniproject.backend.repository;

import com.miniproject.backend.model.CampusBuzz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface CampusBuzzRepository extends MongoRepository<CampusBuzz, String> {
    
    // Find all by category
    List<CampusBuzz> findByCategory(String category);
    
    // Find upcoming events (eventDate > current time)
    @Query("{ 'eventDate': { $gte: ?0 } }")
    List<CampusBuzz> findUpcomingEvents(long currentTime);
    
    // Find pinned announcements
    List<CampusBuzz> findByIsPinnedTrue();
    
    // Find recent buzz (sorted by createdAt desc)
    List<CampusBuzz> findTop10ByOrderByCreatedAtDesc();
    
    // Find by category ordered by priority and date
    List<CampusBuzz> findByCategoryOrderByPriorityDescEventDateAsc(String category);
}
