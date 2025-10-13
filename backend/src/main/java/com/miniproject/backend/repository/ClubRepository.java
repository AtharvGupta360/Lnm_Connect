package com.miniproject.backend.repository;

import com.miniproject.backend.model.Club;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClubRepository extends MongoRepository<Club, String> {
}
