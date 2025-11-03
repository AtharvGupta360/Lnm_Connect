package com.miniproject.backend.repository;

import com.miniproject.backend.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    boolean existsByUserIdAndPostId(String userId, String postId);
    List<Application> findByPostId(String postId);
    Optional<Application> findByUserIdAndPostId(String userId, String postId);
}
