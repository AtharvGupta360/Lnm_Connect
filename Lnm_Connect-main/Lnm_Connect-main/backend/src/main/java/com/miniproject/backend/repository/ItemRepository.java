package com.miniproject.backend.repository;

import com.miniproject.backend.model.Item;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ItemRepository extends MongoRepository<Item, String> {
}
