package com.nextstep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextstep.dto.JDMatchResponse;
import com.nextstep.dto.JDMatchCategoryDTO;
import com.nextstep.dto.GeminiJDMatchResult;
import com.nextstep.model.*;
import com.nextstep.repository.UserRepository;
import com.nextstep.service.TokenService;
import com.nextstep.repository.JDMatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JDMatchService {

    private final JDMatchRepository jdMatchRepository;
    private final ResumeService resumeService;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;
    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Value("${app.gemini.api-url}")
    private String geminiApiUrl;

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    @Transactional
    public JDMatchResponse analyzeJDMatch(String jdText, MultipartFile resumeFile,
                                          String jobTitle, String companyName, User user) {

        // Consume token first
        tokenService.consumeTokens(user, 2);

        try {
            // Extract resume text directly (no disk storage)
            String resumeText = resumeService.extractTextFromFile(resumeFile);

            // Analyze with Gemini
            GeminiJDMatchResult geminiResult = analyzeWithGemini(jdText, resumeText, jobTitle, companyName);

            // Save to database
            JDMatchResult matchResult = saveMatchResult(user, jdText, resumeText,
                    jobTitle, companyName, geminiResult);

            return convertToResponse(matchResult);
        } catch (Exception e) {
            // Refund token on failure
            user.setTokensRemaining(user.getTokensRemaining() + 2);
            userRepository.save(user);
            log.error("Error analyzing JD match", e);
            throw new RuntimeException("Failed to analyze job description match: " + e.getMessage());
        }
    }

    @Transactional
    public JDMatchResponse analyzeJDMatchWithFile(MultipartFile jdFile, MultipartFile resumeFile,
                                                  String jobTitle, String companyName, User user) {

        // Consume token first
        tokenService.consumeTokens(user, 2);

        try {
            // Extract JD text directly (no disk storage)
            String jdText = resumeService.extractTextFromFile(jdFile);

            // Extract resume text directly (no disk storage)
            String resumeText = resumeService.extractTextFromFile(resumeFile);

            // Analyze with Gemini
            GeminiJDMatchResult geminiResult = analyzeWithGemini(jdText, resumeText, jobTitle, companyName);

            // Save to database
            JDMatchResult matchResult = saveMatchResult(user, jdText, resumeText,
                    jobTitle, companyName, geminiResult);

            return convertToResponse(matchResult);
        } catch (Exception e) {
            // Refund token on failure
            user.setTokensRemaining(user.getTokensRemaining() + 2);
            userRepository.save(user);
            log.error("Error analyzing JD match with file upload", e);
            throw new RuntimeException("Failed to analyze with uploaded JD: " + e.getMessage());
        }
    }

    public List<JDMatchResponse> getUserMatches(User user) {
        List<JDMatchResult> matches = jdMatchRepository.findByUserOrderByCreatedAtDesc(user);
        return matches.stream()
                .limit(6)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public JDMatchResponse getMatchById(Long matchId, User user) {
        JDMatchResult match = jdMatchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match result not found"));

        if (!match.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to match result");
        }

        return convertToResponse(match);
    }

    private GeminiJDMatchResult analyzeWithGemini(String jdText, String resumeText,
                                                  String jobTitle, String companyName) {
        String prompt = buildJDMatchPrompt(jdText, resumeText, jobTitle, companyName);

        try {
            WebClient webClient = webClientBuilder.baseUrl(geminiApiUrl).build();

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            String response = webClient.post()
                    .uri("/models/" + model + ":generateContent?key=" + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseGeminiResponse(response);

        } catch (Exception e) {
            log.error("Error calling Gemini API for JD match", e);
            throw new RuntimeException("AI analysis failed", e);
        }
    }

    private String buildJDMatchPrompt(String jdText, String resumeText,
                                      String jobTitle, String companyName) {
        return String.format("""
            You are an expert ATS (Applicant Tracking System) and recruitment specialist.
            
            Analyze how well this resume matches the given job description and provide a structured JSON response.
            
            JOB DETAILS:
            Title: %s
            Company: %s
            
            JOB DESCRIPTION:
            %s
            
            CANDIDATE RESUME:
            %s
            
            Provide your analysis in this EXACT JSON format (no markdown, no extra text):
            {
              "overallMatchScore": <score 0-100>,
              "matchAnalysis": "<detailed paragraph explaining the match quality>",
              "missingSkills": "<comma-separated list of required skills missing from resume>",
              "missingKeywords": "<comma-separated list of important keywords missing from resume>",
              "suggestions": "<actionable suggestions to improve resume for this job>",
              "matchCategories": [
                {"categoryName": "Skills Match", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Experience Relevance", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Education & Qualifications", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Keywords & ATS Optimization", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Cultural & Role Fit", "categoryScore": <0-100>, "categoryDescription": "<description>"}
              ]
            }
            
            IMPORTANT:
            - Be honest and constructive
            - Focus on actionable improvements
            - Identify specific missing skills and keywords from the JD
            - Consider ATS optimization
            - Respond ONLY with valid JSON
            """,
                jobTitle != null ? jobTitle : "Not specified",
                companyName != null ? companyName : "Not specified",
                jdText,
                resumeText
        );
    }

    private GeminiJDMatchResult parseGeminiResponse(String response) {
        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            String textContent = jsonNode.at("/candidates/0/content/parts/0/text").asText();

            // Clean markdown if present
            textContent = textContent.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "").trim();

            JsonNode analysisJson = objectMapper.readTree(textContent);

            List<JDMatchCategoryDTO> categories = new ArrayList<>();
            JsonNode categoriesNode = analysisJson.get("matchCategories");
            if (categoriesNode != null && categoriesNode.isArray()) {
                for (JsonNode category : categoriesNode) {
                    categories.add(JDMatchCategoryDTO.builder()
                            .categoryName(category.get("categoryName").asText())
                            .categoryScore(category.get("categoryScore").asInt())
                            .categoryDescription(category.get("categoryDescription").asText())
                            .build());
                }
            }

            return GeminiJDMatchResult.builder()
                    .overallMatchScore(analysisJson.get("overallMatchScore").asInt())
                    .matchAnalysis(analysisJson.get("matchAnalysis").asText())
                    .missingSkills(analysisJson.get("missingSkills").asText())
                    .missingKeywords(analysisJson.get("missingKeywords").asText())
                    .suggestions(analysisJson.get("suggestions").asText())
                    .matchCategories(categories)
                    .build();

        } catch (Exception e) {
            log.error("Error parsing Gemini JD match response", e);
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    private JDMatchResult saveMatchResult(User user, String jdText, String resumeText,
                                          String jobTitle, String companyName,
                                          GeminiJDMatchResult geminiResult) {
        JDMatchResult matchResult = JDMatchResult.builder()
                .user(user)
                .jobTitle(jobTitle)
                .companyName(companyName)
                .jdText(jdText)
                .resumeText(resumeText)
                .overallMatchScore(geminiResult.getOverallMatchScore())
                .matchAnalysis(geminiResult.getMatchAnalysis())
                .missingSkills(geminiResult.getMissingSkills())
                .missingKeywords(geminiResult.getMissingKeywords())
                .suggestions(geminiResult.getSuggestions())
                .build();

        matchResult = jdMatchRepository.save(matchResult);

        // Save categories
        for (JDMatchCategoryDTO dto : geminiResult.getMatchCategories()) {
            JDMatchCategory category = JDMatchCategory.builder()
                    .jdMatchResult(matchResult)
                    .categoryName(dto.getCategoryName())
                    .categoryScore(dto.getCategoryScore())
                    .categoryDescription(dto.getCategoryDescription())
                    .build();
            matchResult.getMatchCategories().add(category);
        }

        return jdMatchRepository.save(matchResult);
    }

    private JDMatchResponse convertToResponse(JDMatchResult matchResult) {
        List<JDMatchCategoryDTO> categories = matchResult.getMatchCategories().stream()
                .map(mc -> JDMatchCategoryDTO.builder()
                        .id(mc.getId())
                        .categoryName(mc.getCategoryName())
                        .categoryScore(mc.getCategoryScore())
                        .categoryDescription(mc.getCategoryDescription())
                        .build())
                .collect(Collectors.toList());

        return JDMatchResponse.builder()
                .id(matchResult.getId())
                .jobTitle(matchResult.getJobTitle())
                .companyName(matchResult.getCompanyName())
                .overallMatchScore(matchResult.getOverallMatchScore())
                .matchAnalysis(matchResult.getMatchAnalysis())
                .missingSkills(matchResult.getMissingSkills())
                .missingKeywords(matchResult.getMissingKeywords())
                .suggestions(matchResult.getSuggestions())
                .createdAt(matchResult.getCreatedAt())
                .matchCategories(categories)
                .build();
    }
}