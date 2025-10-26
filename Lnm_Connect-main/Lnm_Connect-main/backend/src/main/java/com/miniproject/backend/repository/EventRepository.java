package com.miniproject.backend.repository;

import com.miniproject.backend.model.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {
    
    // Find upcoming events
    @Query("{'eventDate': {$gte: ?0}, 'status': 'upcoming', 'isPublic': true}")
    List<Event> findUpcomingEvents(LocalDateTime now);
    
    // Find events by status
    List<Event> findByStatusAndIsPublicTrue(String status);
    
    // Find events by organizer
    List<Event> findByOrganizerIdOrderByEventDateDesc(String organizerId);
    
    // Find events by activity type
    List<Event> findByActivityTypeAndIsPublicTrueOrderByEventDateAsc(String activityType);
    
    // Find events by domain tags (contains any of the tags)
    @Query("{'domainTags': {$in: ?0}, 'isPublic': true, 'status': 'upcoming'}")
    List<Event> findByDomainTagsIn(List<String> tags);
    
    // Find events with available spots
    @Query("{'currentParticipants': {$lt: '$maxParticipants'}, 'status': 'upcoming', 'isPublic': true}")
    List<Event> findEventsWithAvailableSpots();
}
