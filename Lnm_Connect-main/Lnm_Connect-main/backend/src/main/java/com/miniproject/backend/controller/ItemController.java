    package com.miniproject.backend.controller;
    // Get posts by userId (author id)
    
import com.miniproject.backend.model.Item;
import com.miniproject.backend.repository.ItemRepository;
import com.miniproject.backend.model.Comment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;
import java.util.Set;

@RestController
@RequestMapping("/api/items")
@CrossOrigin(origins = "*")
public class ItemController {
    @Autowired
    private ItemRepository itemRepository;

    @GetMapping
    public List<Item> getAllItems() {
        List<Item> items = itemRepository.findAll();
        items.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt())); // newest first
        return items;
    }

    @PostMapping
    public Item createItem(@RequestBody Item item) {
        Item saved = itemRepository.save(item);
        System.out.println("[INFO] User post created: " + saved.getName() + " - " + saved.getDescription());
        return saved;
    }
    // Like or unlike a post (toggle)
    @PostMapping("/{itemId}/like")
    public Item likeOrUnlikeItem(@PathVariable String itemId, @RequestParam String userId) {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return null;
        Set<String> likes = item.getLikes();
        if (likes.contains(userId)) {
            likes.remove(userId); // Unlike
        } else {
            likes.add(userId); // Like
        }
        item.setLikes(likes);
        return itemRepository.save(item);
    }

    // Add a comment to a post
    @PostMapping("/{itemId}/comment")
    public Item addComment(@PathVariable String itemId, @RequestBody Comment comment) {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return null;
        List<Comment> comments = item.getComments();
        if (comments == null) comments = new ArrayList<>();
        comments.add(comment);
        item.setComments(comments);
        return itemRepository.save(item);
    }

    // Get comments for a post
    @GetMapping("/{itemId}/comments")
    public List<Comment> getComments(@PathVariable String itemId) {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return new ArrayList<>();
        List<Comment> comments = item.getComments();
        return comments == null ? new ArrayList<>() : comments;
    }

    // Get likes for a post
    @GetMapping("/{itemId}/likes")
    public Set<String> getLikes(@PathVariable String itemId) {
        Item item = itemRepository.findById(itemId).orElse(null);
        if (item == null) return null;
        return item.getLikes();
    }

    @GetMapping("/userId/{userId}")
    public List<Item> getPostsByUserId(@PathVariable String userId) {
        List<Item> items = itemRepository.findAll();
        List<Item> filtered = new ArrayList<>();
        for (Item item : items) {
            if (userId.equals(item.getUserId())) {
                filtered.add(item);
            }
        }
        filtered.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
        return filtered;
    }
}
