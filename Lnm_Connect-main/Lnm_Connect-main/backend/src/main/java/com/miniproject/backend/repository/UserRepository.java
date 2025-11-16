package com.miniproject.backend.repository;

import com.miniproject.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
    Optional<User> findByName(String name);
}
