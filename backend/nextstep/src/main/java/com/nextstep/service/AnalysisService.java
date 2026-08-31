package com.nextstep.service;

import com.nextstep.repository.UserRepository;
import com.nextstep.service.TokenService;
import com.nextstep.dto.AnalysisResponse;
import com.nextstep.dto.GeminiAnalysisResult;
import com.nextstep.dto.MicroCategoryDTO;
import com.nextstep.model.*;
import com.nextstep.repository.AnalysisRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisService {

    private final AnalysisRepository analysisRepository;
    private final GitHubService gitHubService;
    private final LinkedInService linkedInService;
    private final ResumeService resumeService;
    private final GeminiService geminiService;
    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Transactional
    public AnalysisResponse analyzeGitHub(String githubUrl, User user) {
        tokenService.consumeTokens(user, 1);
        try {
            // Fetch GitHub data
            Map<String, Object> githubData = gitHubService.fetchGitHubProfile(githubUrl);

            // Analyze with Gemini
            GeminiAnalysisResult result = geminiService.analyzeGithubProfile(githubData, user);

            // Save to database
            Analysis analysis = saveAnalysis(user, AnalysisType.GITHUB, result);

            return convertToResponse(analysis);
        } catch (Exception e) {
            log.error("Error analyzing GitHub profile", e);
            user.setTokensRemaining(user.getTokensRemaining() + 1);
            userRepository.save(user);
            throw new RuntimeException("Failed to analyze GitHub profile: " + e.getMessage());
        }
    }



    @Transactional
    public AnalysisResponse analyzeLinkedIn(String linkedinUrl, User user) {
        tokenService.consumeTokens(user, 1);
        try {
            // Fetch LinkedIn data
            Map<String, Object> linkedinData = linkedInService.fetchLinkedInProfile(linkedinUrl);

            // Analyze with Gemini
            GeminiAnalysisResult result = geminiService.analyzeLinkedInProfile(linkedinData, user);

            // Save to database
            Analysis analysis = saveAnalysis(user, AnalysisType.LINKEDIN, result);

            return convertToResponse(analysis);
        } catch (Exception e) {
            log.error("Error analyzing LinkedIn profile", e);
            user.setTokensRemaining(user.getTokensRemaining() + 1);
            userRepository.save(user);
            throw new RuntimeException("Failed to analyze LinkedIn profile: " + e.getMessage());
        }
    }

    @Transactional
    public AnalysisResponse analyzeResume(MultipartFile file, User user) {
        // Consume token first
        tokenService.consumeTokens(user, 1);

        try {
            // Extract text directly from file (no disk storage)
            String resumeText = resumeService.extractTextFromFile(file);

            // Analyze with Gemini
            GeminiAnalysisResult result = geminiService.analyzeResume(resumeText, user);

            // Save analysis to database
            Analysis analysis = saveAnalysis(user, AnalysisType.RESUME, result);

            return convertToResponse(analysis);
        } catch (Exception e) {
            // Refund token on failure
            user.setTokensRemaining(user.getTokensRemaining() + 1);
            userRepository.save(user);
            log.error("Error analyzing resume", e);
            throw new RuntimeException("Failed to analyze resume: " + e.getMessage());
        }
    }

    public List<AnalysisResponse> getUserAnalyses(User user) {
        List<Analysis> analyses = analysisRepository.findByUserOrderByCreatedAtDesc(user);

        // Return ALL analyses for progression tracking
        return analyses.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public AnalysisResponse getAnalysisById(Long analysisId, User user) {
        Analysis analysis = analysisRepository.findById(analysisId)
                .orElseThrow(() -> new RuntimeException("Analysis not found"));

        if (!analysis.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to analysis");
        }

        return convertToResponse(analysis);
    }

    private Analysis saveAnalysis(User user, AnalysisType type, GeminiAnalysisResult result) {
        Analysis analysis = Analysis.builder()
                .user(user)
                .analysisType(type)
                .overallScore(result.getOverallScore())
                .analysisText(result.getAnalysisText())
                .suggestions(result.getSuggestions())
                .build();

        analysis = analysisRepository.save(analysis);

        // Save micro categories
        for (MicroCategoryDTO dto : result.getMicroCategories()) {
            MicroCategory microCategory = MicroCategory.builder()
                    .analysis(analysis)
                    .categoryName(dto.getCategoryName())
                    .categoryScore(dto.getCategoryScore())
                    .categoryDescription(dto.getCategoryDescription())
                    .build();
            analysis.getMicroCategories().add(microCategory);
        }

        return analysisRepository.save(analysis);
    }

    private AnalysisResponse convertToResponse(Analysis analysis) {
        List<MicroCategoryDTO> microCategories = analysis.getMicroCategories().stream()
                .map(mc -> MicroCategoryDTO.builder()
                        .id(mc.getId())
                        .categoryName(mc.getCategoryName())
                        .categoryScore(mc.getCategoryScore())
                        .categoryDescription(mc.getCategoryDescription())
                        .build())
                .collect(Collectors.toList());

        return AnalysisResponse.builder()
                .id(analysis.getId())
                .analysisType(analysis.getAnalysisType())
                .overallScore(analysis.getOverallScore())
                .analysisText(analysis.getAnalysisText())
                .suggestions(analysis.getSuggestions())
                .createdAt(analysis.getCreatedAt())
                .microCategories(microCategories)
                .build();
    }
}
