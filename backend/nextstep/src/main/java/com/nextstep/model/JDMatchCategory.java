package com.nextstep.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "jd_match_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JDMatchCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jd_match_result_id", nullable = false)
    private JDMatchResult jdMatchResult;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "category_score", nullable = false)
    private Integer categoryScore;

    @Column(name = "category_description", columnDefinition = "TEXT")
    private String categoryDescription;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}