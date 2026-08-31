package com.nextstep.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiJDMatchResult {
    private Integer overallMatchScore;
    private String matchAnalysis;
    private String missingSkills;
    private String missingKeywords;
    private String suggestions;
    private List<JDMatchCategoryDTO> matchCategories;
}