package com.nextstep.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JDMatchResponse {
    private Long id;
    private String jobTitle;
    private String companyName;
    private Integer overallMatchScore;
    private String matchAnalysis;
    private String missingSkills;
    private String missingKeywords;
    private String suggestions;
    private LocalDateTime createdAt;
    private List<JDMatchCategoryDTO> matchCategories;
}