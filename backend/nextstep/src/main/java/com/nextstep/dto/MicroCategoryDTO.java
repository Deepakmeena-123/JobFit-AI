package com.nextstep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MicroCategoryDTO {
    private Long id;
    private String categoryName;
    private Integer categoryScore;
    private String categoryDescription;
}