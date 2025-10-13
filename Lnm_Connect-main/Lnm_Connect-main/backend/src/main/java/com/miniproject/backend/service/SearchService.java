package com.miniproject.backend.service;

import com.miniproject.backend.dto.SearchResponseDTO;
import com.miniproject.backend.dto.SearchResultDTO;
import com.miniproject.backend.model.Post;
import com.miniproject.backend.model.User;
import com.miniproject.backend.repository.PostRepository;
import com.miniproject.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    /**
     * Global search across users, posts, and projects
     * @param query - search query string
     * @param limit - max results per category
     * @return SearchResponseDTO with categorized results
     */
    @Cacheable(value = "searchResults", key = "#query")
    public SearchResponseDTO globalSearch(String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return new SearchResponseDTO(new ArrayList<>(), new ArrayList<>(), new ArrayList<>(), 0, query);
        }

        String searchTerm = query.trim().toLowerCase();

        // Search users (profiles)
        List<SearchResultDTO> profiles = searchUsers(searchTerm, limit);

        // Search posts
        List<SearchResultDTO> posts = searchPosts(searchTerm, limit);

        // Search projects/opportunities (using posts with specific tags for now)
        List<SearchResultDTO> projects = searchProjects(searchTerm, limit);

        int totalResults = profiles.size() + posts.size() + projects.size();

        return new SearchResponseDTO(profiles, posts, projects, totalResults, query);
    }

    /**
     * Search users by name, email, skills, interests, college, branch
     */
    private List<SearchResultDTO> searchUsers(String query, int limit) {
        try {
            List<User> users = userRepository.findAll();
            
            return users.stream()
                    .filter(user -> matchesUserQuery(user, query))
                    .limit(limit)
                    .map(this::mapUserToSearchResult)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Check if user matches search query
     */
    private boolean matchesUserQuery(User user, String query) {
        if (user.getName() != null && user.getName().toLowerCase().contains(query)) return true;
        if (user.getEmail() != null && user.getEmail().toLowerCase().contains(query)) return true;
        if (user.getEducation() != null && user.getEducation().toLowerCase().contains(query)) return true;
        if (user.getBranchYear() != null && user.getBranchYear().toLowerCase().contains(query)) return true;
        if (user.getBio() != null && user.getBio().toLowerCase().contains(query)) return true;
        if (user.getSkills() != null) {
            for (String skill : user.getSkills()) {
                if (skill.toLowerCase().contains(query)) return true;
            }
        }
        if (user.getInterests() != null) {
            for (String interest : user.getInterests()) {
                if (interest.toLowerCase().contains(query)) return true;
            }
        }
        return false;
    }

    /**
     * Map User entity to SearchResultDTO
     */
    private SearchResultDTO mapUserToSearchResult(User user) {
        SearchResultDTO result = new SearchResultDTO();
        result.setId(user.getId());
        result.setType("profile");
        result.setTitle(user.getName() != null ? user.getName() : "Unknown User");
        
        // Create subtitle from education and branch/year
        String subtitle = "";
        if (user.getEducation() != null && !user.getEducation().isEmpty()) {
            subtitle = user.getEducation();
        }
        if (user.getBranchYear() != null && !user.getBranchYear().isEmpty()) {
            subtitle += (subtitle.isEmpty() ? "" : " • ") + user.getBranchYear();
        }
        result.setSubtitle(subtitle.isEmpty() ? "LNM Connect User" : subtitle);
        
        // Create snippet from skills or bio
        String snippet = "";
        if (user.getSkills() != null && !user.getSkills().isEmpty()) {
            snippet = "Skills: " + String.join(", ", user.getSkills().subList(0, Math.min(3, user.getSkills().size())));
        } else if (user.getBio() != null && !user.getBio().isEmpty()) {
            snippet = user.getBio().length() > 100 ? user.getBio().substring(0, 100) + "..." : user.getBio();
        }
        result.setSnippet(snippet);
        
        // Avatar URL
        String initial = user.getName() != null && !user.getName().isEmpty() 
            ? user.getName().substring(0, 1).toUpperCase() 
            : "U";
        result.setImageUrl("https://ui-avatars.com/api/?name=" + initial + "&background=6366f1&color=fff&size=128");
        
        result.setTags(user.getSkills() != null ? user.getSkills() : new ArrayList<>());
        result.setAuthorId(user.getId());
        result.setAuthorName(user.getName());
        
        return result;
    }

    /**
     * Search posts by title, body, tags
     */
    private List<SearchResultDTO> searchPosts(String query, int limit) {
        try {
            List<Post> posts = postRepository.findAll();
            
            return posts.stream()
                    .filter(post -> matchesPostQuery(post, query))
                    .limit(limit)
                    .map(this::mapPostToSearchResult)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error searching posts: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Check if post matches search query
     */
    private boolean matchesPostQuery(Post post, String query) {
        if (post.getTitle() != null && post.getTitle().toLowerCase().contains(query)) return true;
        if (post.getBody() != null && post.getBody().toLowerCase().contains(query)) return true;
        if (post.getTags() != null) {
            for (String tag : post.getTags()) {
                if (tag.toLowerCase().contains(query)) return true;
            }
        }
        if (post.getAuthorName() != null && post.getAuthorName().toLowerCase().contains(query)) return true;
        return false;
    }

    /**
     * Map Post entity to SearchResultDTO
     */
    private SearchResultDTO mapPostToSearchResult(Post post) {
        SearchResultDTO result = new SearchResultDTO();
        result.setId(post.getId());
        result.setType("post");
        result.setTitle(post.getTitle() != null ? post.getTitle() : "Untitled Post");
        result.setSubtitle("by " + (post.getAuthorName() != null ? post.getAuthorName() : "Unknown"));
        
        // Create snippet from body
        String snippet = "";
        if (post.getBody() != null && !post.getBody().isEmpty()) {
            snippet = post.getBody().length() > 150 
                ? post.getBody().substring(0, 150) + "..." 
                : post.getBody();
        }
        result.setSnippet(snippet);
        
        result.setImageUrl(post.getImage());
        result.setTags(post.getTags() != null ? post.getTags() : new ArrayList<>());
        result.setAuthorId(post.getAuthorId());
        result.setAuthorName(post.getAuthorName());
        
        return result;
    }

    /**
     * Search projects/opportunities (using posts with project-related tags)
     */
    private List<SearchResultDTO> searchProjects(String query, int limit) {
        try {
            List<Post> posts = postRepository.findAll();
            
            List<String> projectTags = List.of(
                "Project Collaboration", "Open Source", "Research Opportunity",
                "Internship", "Hackathon", "Startup"
            );
            
            return posts.stream()
                    .filter(post -> post.getTags() != null && 
                            post.getTags().stream().anyMatch(projectTags::contains))
                    .filter(post -> matchesPostQuery(post, query))
                    .limit(limit)
                    .map(this::mapProjectToSearchResult)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error searching projects: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Map Post entity to SearchResultDTO for projects
     */
    private SearchResultDTO mapProjectToSearchResult(Post post) {
        SearchResultDTO result = mapPostToSearchResult(post);
        result.setType("project");
        return result;
    }
}
