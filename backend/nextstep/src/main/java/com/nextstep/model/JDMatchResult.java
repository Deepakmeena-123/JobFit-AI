package com.nextstep.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jd_match_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JDMatchResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "jd_text", columnDefinition = "TEXT", nullable = false)
    private String jdText;

    @Column(name = "resume_text", columnDefinition = "TEXT", nullable = false)
    private String resumeText;

    @Column(name = "overall_match_score", nullable = false)
    private Integer overallMatchScore;

    @Column(name = "match_analysis", columnDefinition = "TEXT", nullable = false)
    private String matchAnalysis;

    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private String missingSkills;

    @Column(name = "missing_keywords", columnDefinition = "TEXT")
    private String missingKeywords;

    @Column(name = "suggestions", columnDefinition = "TEXT", nullable = false)
    private String suggestions;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "jdMatchResult", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<JDMatchCategory> matchCategories = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}