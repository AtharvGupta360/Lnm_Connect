package com.miniproject.backend.controller;

import com.miniproject.backend.dto.SearchResponseDTO;
import com.miniproject.backend.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SearchService searchService;

    /**
     * Global search endpoint
     * @param q - search query string
     * @param limit - optional, max results per category (default: 5)
     * @return SearchResponseDTO with categorized results
     */
    @GetMapping
    public ResponseEntity<SearchResponseDTO> search(
            @RequestParam(value = "q", required = true) String query,
            @RequestParam(value = "limit", defaultValue = "5") int limit
    ) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            SearchResponseDTO results = searchService.globalSearch(query, limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Search error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Quick search for autocomplete (returns only top 3 per category)
     */
    @GetMapping("/quick")
    public ResponseEntity<SearchResponseDTO> quickSearch(
            @RequestParam(value = "q", required = true) String query
    ) {
        try {
            if (query == null || query.trim().isEmpty() || query.length() < 2) {
                return ResponseEntity.badRequest().build();
            }

            SearchResponseDTO results = searchService.globalSearch(query, 3);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Quick search error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
