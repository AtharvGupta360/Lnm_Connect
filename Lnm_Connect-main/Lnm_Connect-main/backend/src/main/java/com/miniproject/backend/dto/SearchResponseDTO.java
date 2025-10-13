package com.miniproject.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponseDTO {
    private List<SearchResultDTO> profiles;
    private List<SearchResultDTO> posts;
    private List<SearchResultDTO> projects;
    private int totalResults;
    private String query;
}
