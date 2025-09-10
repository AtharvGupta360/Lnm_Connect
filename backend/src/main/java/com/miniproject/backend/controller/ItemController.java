package com.miniproject.backend.controller;

import com.miniproject.backend.model.Item;
import com.miniproject.backend.repository.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {
    @Autowired
    private ItemRepository itemRepository;

    @GetMapping
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    @PostMapping
    public Item createItem(@RequestBody Item item) {
        Item saved = itemRepository.save(item);
        System.out.println("[INFO] User post created: " + saved.getName() + " - " + saved.getDescription());
        return saved;
    }
}
