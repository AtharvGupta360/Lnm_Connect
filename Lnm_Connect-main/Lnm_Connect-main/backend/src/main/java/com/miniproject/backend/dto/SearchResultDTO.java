package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {
    private String id;
    private String type; // "profile", "post", "project"
    private String title;
    private String subtitle;
    private String snippet;
    private String imageUrl;
    private List<String> tags;
    private String authorId;
    private String authorName;
    private Object additionalData;
}
