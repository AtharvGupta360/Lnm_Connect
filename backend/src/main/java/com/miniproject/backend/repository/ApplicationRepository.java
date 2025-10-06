package com.miniproject.backend.repository;

import com.miniproject.backend.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ApplicationRepository extends MongoRepository<Application, String> {
    boolean existsByUserIdAndPostId(String userId, String postId);
    List<Application> findByPostId(String postId);
}
