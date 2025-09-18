package com.miniproject.backend.controller;

import com.miniproject.backend.model.Post;
import com.miniproject.backend.repository.PostRepository;
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

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        post.setCreatedAt(System.currentTimeMillis());
        return postRepository.save(post);
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser(@PathVariable String userId) {
        return postRepository.findByAuthorId(userId);
    }
}
