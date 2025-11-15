package com.miniproject.backend.controller;

import com.miniproject.backend.model.Post;
import com.miniproject.backend.repository.PostRepository;
import com.miniproject.backend.dto.PostResponseDTO;
import com.miniproject.backend.service.ApplicationService;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {
    // Like or unlike a post (toggle)
    @PostMapping("/{postId}/like")
    public Post likeOrUnlikePost(@PathVariable String postId, @RequestParam String userId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return null;
        java.util.Set<String> likes = post.getLikes();
        if (likes.contains(userId)) {
            likes.remove(userId); // Unlike
        } else {
            likes.add(userId); // Like
        }
        post.setLikes(likes);
        return postRepository.save(post);
    }

    // Add a comment to a post
    @PostMapping("/{postId}/comment")
    public Post addComment(@PathVariable String postId, @RequestBody com.miniproject.backend.model.Comment comment) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return null;
        java.util.List<com.miniproject.backend.model.Comment> comments = post.getComments();
        if (comments == null) comments = new java.util.ArrayList<>();
        comments.add(comment);
        post.setComments(comments);
        return postRepository.save(post);
    }

    // Get comments for a post
    @GetMapping("/{postId}/comments")
    public java.util.List<com.miniproject.backend.model.Comment> getComments(@PathVariable String postId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return new java.util.ArrayList<>();
        java.util.List<com.miniproject.backend.model.Comment> comments = post.getComments();
        return comments == null ? new java.util.ArrayList<>() : comments;
    }

    // Get likes for a post
    @GetMapping("/{postId}/likes")
    public java.util.Set<String> getLikes(@PathVariable String postId) {
        Post post = postRepository.findById(postId).orElse(null);
        if (post == null) return null;
        return post.getLikes();
    }
    @Autowired
    private PostRepository postRepository;
    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        post.setCreatedAt(System.currentTimeMillis());
        return postRepository.save(post);
    }

    @GetMapping
    public List<PostResponseDTO> getAllPosts(
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "tag", required = false) String tag,
            @RequestParam(value = "author", required = false) String author,
            @RequestParam(value = "from", required = false) Long from,
            @RequestParam(value = "to", required = false) Long to,
            @RequestParam(value = "currentUserId", required = false) String currentUserId
    ) {
        List<Post> posts = postRepository.findAll();
        // Filter by tag
        if (tag != null && !tag.isEmpty()) {
            posts.removeIf(post -> post.getTags() == null || !post.getTags().contains(tag));
        }
        // Filter by author
        if (author != null && !author.isEmpty()) {
            posts.removeIf(post -> post.getAuthorName() == null || !post.getAuthorName().equalsIgnoreCase(author));
        }
        // Filter by time range
        if (from != null) {
            posts.removeIf(post -> post.getCreatedAt() < from);
        }
        if (to != null) {
            posts.removeIf(post -> post.getCreatedAt() > to);
        }
        // Sort
        if ("likes".equalsIgnoreCase(sort)) {
            posts.sort((a, b) -> Integer.compare(
                b.getLikes() != null ? b.getLikes().size() : 0,
                a.getLikes() != null ? a.getLikes().size() : 0
            ));
        } else if ("oldest".equalsIgnoreCase(sort)) {
            posts.sort((a, b) -> Long.compare(a.getCreatedAt(), b.getCreatedAt()));
        } else { // default or "recent"
            posts.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
        }
        List<PostResponseDTO> result = new ArrayList<>();
        for (Post post : posts) {
            result.add(applicationService.getPostWithApplyInfo(post, currentUserId));
        }
        return result;
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser(@PathVariable String userId) {
        return postRepository.findByAuthorId(userId);
    }

    /**
     * Get popular projects (most liked posts with Project tag)
     */
    @GetMapping("/popular-projects")
    public List<Post> getPopularProjects(@RequestParam(defaultValue = "10") int limit) {
        List<Post> allPosts = postRepository.findAll();
        
        return allPosts.stream()
                .filter(post -> post.getTags() != null && 
                        post.getTags().stream().anyMatch(tag -> 
                                tag.toLowerCase().contains("project") || 
                                tag.toLowerCase().contains("collab") ||
                                tag.toLowerCase().contains("team") ||
                                tag.toLowerCase().contains("build")))
                .sorted((a, b) -> Integer.compare(b.getLikes().size(), a.getLikes().size()))
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get trending posts (recent + high engagement)
     */
    @GetMapping("/trending")
    public List<Post> getTrendingPosts(@RequestParam(defaultValue = "10") int limit) {
        List<Post> allPosts = postRepository.findAll();
        long oneDayAgo = System.currentTimeMillis() - (24 * 60 * 60 * 1000);
        
        return allPosts.stream()
                .filter(post -> post.getCreatedAt() > oneDayAgo)
                .sorted((a, b) -> {
                    int scoreA = a.getLikes().size() * 2 + (a.getComments() != null ? a.getComments().size() : 0);
                    int scoreB = b.getLikes().size() * 2 + (b.getComments() != null ? b.getComments().size() : 0);
                    return Integer.compare(scoreB, scoreA);
                })
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get trending topics (most used tags in last week)
     */
    @GetMapping("/trending-topics")
    public List<java.util.Map<String, Object>> getTrendingTopics() {
        List<Post> allPosts = postRepository.findAll();
        long oneWeekAgo = System.currentTimeMillis() - (7 * 24 * 60 * 60 * 1000);
        
        java.util.Map<String, Integer> tagCount = new java.util.HashMap<>();
        
        allPosts.stream()
                .filter(post -> post.getCreatedAt() > oneWeekAgo && post.getTags() != null)
                .flatMap(post -> post.getTags().stream())
                .forEach(tag -> tagCount.put(tag, tagCount.getOrDefault(tag, 0) + 1));
        
        return tagCount.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(10)
                .map(entry -> {
                    java.util.Map<String, Object> topic = new java.util.HashMap<>();
                    topic.put("name", entry.getKey());
                    topic.put("count", entry.getValue());
                    return topic;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Delete a post (author only)
     * DELETE /api/posts/{postId}?userId=xxx
     */
    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable String postId, @RequestParam String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Check if user is the author
        if (!post.getAuthorId().equals(userId)) {
            throw new RuntimeException("Only the author can delete this post");
        }
        
        postRepository.delete(post);
    }
}

