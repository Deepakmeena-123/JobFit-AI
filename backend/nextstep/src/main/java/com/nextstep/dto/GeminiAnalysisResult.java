package com.nextstep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiAnalysisResult {
    private Integer overallScore;
    private String analysisText;
    private String suggestions;
    private List<MicroCategoryDTO> microCategories;
}