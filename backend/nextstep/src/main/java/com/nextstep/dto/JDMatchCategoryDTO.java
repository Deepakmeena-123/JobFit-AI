package com.nextstep.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JDMatchCategoryDTO {
    private Long id;
    private String categoryName;
    private Integer categoryScore;
    private String categoryDescription;
}