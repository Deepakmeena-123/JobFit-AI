package com.nextstep.dto;

import com.nextstep.model.AnalysisType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {
    private Long id;
    private AnalysisType analysisType;
    private Integer overallScore;
    private String analysisText;
    private String suggestions;
    private LocalDateTime createdAt;
    private List<MicroCategoryDTO> microCategories;
}