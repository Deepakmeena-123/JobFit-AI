package com.nextstep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextstep.dto.GeminiAnalysisResult;
import com.nextstep.dto.MicroCategoryDTO;
import com.nextstep.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-url}")
    private String geminiApiUrl;

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    // ============================================================
    // PROFILE ANALYSIS
    // ============================================================

    public GeminiAnalysisResult analyzeGithubProfile(
            Map<String, Object> githubData,
            User user) {

        String prompt = buildGithubAnalysisPrompt(githubData, user);
        return callGeminiAPI(prompt);
    }

    public GeminiAnalysisResult analyzeLinkedInProfile(
            Map<String, Object> linkedinData,
            User user) {

        String prompt = buildLinkedInAnalysisPrompt(linkedinData, user);
        return callGeminiAPI(prompt);
    }

    public GeminiAnalysisResult analyzeResume(
            String resumeText,
            User user) {

        String prompt = buildResumeAnalysisPrompt(resumeText, user);
        return callGeminiAPI(prompt);
    }

    // ============================================================
    // CHATBOT
    // ============================================================

    public String getChatbotResponse(
            String userMessage,
            String messageType) {

        String prompt = buildChatbotPrompt(userMessage, messageType);

        try {
            return callGeminiChatAPI(prompt);

        } catch (Exception e) {

            log.error("Error getting chatbot response", e);

            return "I apologize, but I'm having trouble processing "
                    + "your request right now. Please try again.";
        }
    }

    // ============================================================
    // GITHUB PROMPT
    // ============================================================

    private String buildGithubAnalysisPrompt(
            Map<String, Object> data,
            User user) {

        String userContext = buildUserContext(user);

        return String.format("""
                Analyze this GitHub profile and return ONLY valid JSON.

                IMPORTANT:
                - overallScore must be an integer between 0 and 100.
                - categoryScore must be an integer between 0 and 100.
                - Do not return markdown.
                - Do not wrap the JSON in ```json.
                - Do not add explanations outside the JSON.
                - Calculate the score from the actual GitHub data.
                - Do NOT always use 50.

                Required JSON format:
                {
                  "overallScore": 0,
                  "analysisText": "detailed analysis",
                  "suggestions": "actionable suggestions",
                  "microCategories": [
                    {
                      "categoryName": "Profile Completeness",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Repository Quality",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Activity Level",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Community Engagement",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Code Quality",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    }
                  ]
                }

                %s

                GitHub Data:
                - Public Repos: %s
                - Followers: %s
                - Following: %s
                - Bio: %s
                - Location: %s
                - Company: %s
                - Blog/Website: %s

                Provide honest and constructive feedback.
                """,
                userContext,
                data.get("public_repos"),
                data.get("followers"),
                data.get("following"),
                data.get("bio"),
                data.get("location"),
                data.get("company"),
                data.get("blog")
        );
    }

    // ============================================================
    // LINKEDIN PROMPT
    // ============================================================

    private String buildLinkedInAnalysisPrompt(
            Map<String, Object> data,
            User user) {

        String userContext = buildUserContext(user);

        return String.format("""
                Analyze this LinkedIn profile and return ONLY valid JSON.

                IMPORTANT:
                - overallScore must be an integer between 0 and 100.
                - categoryScore must be an integer between 0 and 100.
                - Do not return markdown.
                - Do not wrap the JSON in ```json.
                - Do not add explanations outside the JSON.
                - Calculate the score from the actual LinkedIn data.
                - Do NOT always use 50.

                Required JSON format:
                {
                  "overallScore": 0,
                  "analysisText": "detailed analysis",
                  "suggestions": "actionable suggestions",
                  "microCategories": [
                    {
                      "categoryName": "Profile Completeness",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Professional Branding",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Network Size",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Content Quality",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Skills & Endorsements",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    }
                  ]
                }

                %s

                LinkedIn Data:
                %s

                Provide honest and constructive feedback.
                """,
                userContext,
                data.toString()
        );
    }

    // ============================================================
    // RESUME PROMPT
    // ============================================================

    private String buildResumeAnalysisPrompt(
            String resumeText,
            User user) {

        String userContext = buildUserContext(user);

        return String.format("""
                Analyze this resume and return ONLY valid JSON.

                IMPORTANT:
                - overallScore must be an integer between 0 and 100.
                - categoryScore must be an integer between 0 and 100.
                - Do not return markdown.
                - Do not wrap the JSON in ```json.
                - Do not add explanations outside the JSON.
                - Calculate the score from the actual resume content.
                - Do NOT always use 50.

                Required JSON format:
                {
                  "overallScore": 0,
                  "analysisText": "detailed analysis",
                  "suggestions": "actionable suggestions",
                  "microCategories": [
                    {
                      "categoryName": "Format & Structure",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Content Quality",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Skills Presentation",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Experience Description",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    },
                    {
                      "categoryName": "Impact & Achievements",
                      "categoryScore": 0,
                      "categoryDescription": "description"
                    }
                  ]
                }

                %s

                Resume Text:
                %s

                Evaluate based on:
                - ATS compatibility
                - clarity
                - formatting
                - relevant skills
                - projects
                - experience
                - achievements
                - measurable impact
                - professional presentation

                Provide honest and constructive feedback.
                """,
                userContext,
                resumeText
        );
    }

    // ============================================================
    // CHAT PROMPT
    // ============================================================

    private String buildChatbotPrompt(
            String userMessage,
            String messageType) {

        String context = switch (messageType) {

            case "CAREER_GUIDANCE" ->
                    "You are a career counselor providing professional guidance.";

            case "CODING_HELP" ->
                    "You are a coding mentor helping with programming questions.";

            case "PROFILE_IMPROVEMENT" ->
                    "You are a personal branding expert helping improve professional profiles.";

            default ->
                    "You are a helpful AI assistant focused on career development.";
        };

        return String.format(
                "%s\n\nUser Question: %s\n\n"
                        + "Provide a helpful, concise response.",
                context,
                userMessage
        );
    }

    // ============================================================
    // USER CONTEXT
    // ============================================================

    private String buildUserContext(User user) {

        StringBuilder context =
                new StringBuilder("USER PROFILE CONTEXT:\n");

        if (user.getExperience() != null
                && !user.getExperience().isEmpty()) {

            context.append("- Experience Level: ")
                    .append(user.getExperience())
                    .append("\n");
        }

        if (user.getDesignation() != null
                && !user.getDesignation().isEmpty()) {

            context.append("- Current Role: ")
                    .append(user.getDesignation())
                    .append("\n");
        }

        if (user.getCurrentCompany() != null
                && !user.getCurrentCompany().isEmpty()) {

            context.append("- Current Company: ")
                    .append(user.getCurrentCompany())
                    .append("\n");
        }

        if (context.length()
                > "USER PROFILE CONTEXT:\n".length()) {

            context.append(
                    "\nUse this context to provide more "
                            + "personalized and relevant analysis.\n"
            );

            return context.toString();
        }

        return "";
    }

    // ============================================================
    // GEMINI ANALYSIS API
    // ============================================================

    private GeminiAnalysisResult callGeminiAPI(String prompt) {

        try {

            WebClient webClient = webClientBuilder
                    .baseUrl(geminiApiUrl)
                    .build();

            Map<String, Object> requestBody = Map.of(
                    "contents",
                    List.of(
                            Map.of(
                                    "parts",
                                    List.of(
                                            Map.of(
                                                    "text",
                                                    prompt
                                            )
                                    )
                            )
                    )
            );

            String response = webClient.post()
                    .uri(
                            "/models/"
                                    + model
                                    + ":generateContent?key="
                                    + apiKey
                    )
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .retryWhen(
                            Retry.backoff(
                                            3,
                                            Duration.ofSeconds(2)
                                    )
                                    .filter(
                                            throwable ->
                                                    throwable instanceof
                                                            WebClientResponseException.TooManyRequests
                                    )
                                    .doBeforeRetry(
                                            retrySignal ->
                                                    log.warn(
                                                            "Retrying Gemini API call, attempt: {}",
                                                            retrySignal.totalRetries() + 1
                                                    )
                                    )
                    )
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (response == null || response.isBlank()) {

                throw new RuntimeException(
                        "Gemini returned an empty response"
                );
            }

            return parseGeminiResponse(response);

        } catch (WebClientResponseException.TooManyRequests e) {

            log.error(
                    "Gemini API rate limit exceeded. "
                            + "No analysis score was generated.",
                    e
            );

            throw new RuntimeException(
                    "Gemini API rate limit exceeded. "
                            + "Please check your Gemini quota or try again later."
            );

        } catch (WebClientResponseException e) {

            log.error(
                    "Gemini API returned HTTP {}: {}",
                    e.getStatusCode(),
                    e.getResponseBodyAsString()
            );

            throw new RuntimeException(
                    "Gemini API request failed with HTTP "
                            + e.getStatusCode()
            );

        } catch (Exception e) {

            log.error(
                    "Error calling Gemini API",
                    e
            );

            throw new RuntimeException(
                    "Failed to generate AI analysis: "
                            + e.getMessage(),
                    e
            );
        }
    }

    // ============================================================
    // GEMINI CHAT API
    // ============================================================

    private String callGeminiChatAPI(String prompt) {

        try {

            WebClient webClient = webClientBuilder
                    .baseUrl(geminiApiUrl)
                    .build();

            Map<String, Object> requestBody = Map.of(
                    "contents",
                    List.of(
                            Map.of(
                                    "parts",
                                    List.of(
                                            Map.of(
                                                    "text",
                                                    prompt
                                            )
                                    )
                            )
                    )
            );

            String response = webClient.post()
                    .uri(
                            "/models/"
                                    + model
                                    + ":generateContent?key="
                                    + apiKey
                    )
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (response == null || response.isBlank()) {

                throw new RuntimeException(
                        "Gemini returned an empty chatbot response"
                );
            }

            JsonNode jsonNode =
                    objectMapper.readTree(response);

            String answer = jsonNode
                    .at("/candidates/0/content/parts/0/text")
                    .asText();

            if (answer == null || answer.isBlank()) {

                throw new RuntimeException(
                        "Gemini returned an empty chatbot response"
                );
            }

            return answer;

        } catch (Exception e) {

            log.error(
                    "Error calling Gemini Chat API",
                    e
            );

            throw new RuntimeException(
                    "Failed to get chatbot response",
                    e
            );
        }
    }

    // ============================================================
    // PARSE GEMINI RESPONSE
    // ============================================================

    private GeminiAnalysisResult parseGeminiResponse(
            String response) {

        try {

            JsonNode jsonNode =
                    objectMapper.readTree(response);

            String textContent = jsonNode
                    .at("/candidates/0/content/parts/0/text")
                    .asText();

            if (textContent == null
                    || textContent.isBlank()) {

                throw new RuntimeException(
                        "Gemini response did not contain analysis text"
                );
            }

            // Remove markdown code fences.
            textContent = textContent
                    .replaceAll(
                            "^```json\\s*",
                            ""
                    )
                    .replaceAll(
                            "^```\\s*",
                            ""
                    )
                    .replaceAll(
                            "\\s*```$",
                            ""
                    )
                    .trim();

            // Extract JSON if Gemini accidentally adds text around it.
            int firstBrace =
                    textContent.indexOf('{');

            int lastBrace =
                    textContent.lastIndexOf('}');

            if (firstBrace >= 0
                    && lastBrace > firstBrace) {

                textContent =
                        textContent.substring(
                                firstBrace,
                                lastBrace + 1
                        );
            }

            JsonNode analysisJson =
                    objectMapper.readTree(textContent);

            JsonNode scoreNode =
                    analysisJson.get("overallScore");

            JsonNode analysisTextNode =
                    analysisJson.get("analysisText");

            JsonNode suggestionsNode =
                    analysisJson.get("suggestions");

            if (scoreNode == null
                    || !scoreNode.isNumber()) {

                throw new RuntimeException(
                        "Gemini response does not contain "
                                + "a valid overallScore"
                );
            }

            if (analysisTextNode == null
                    || !analysisTextNode.isTextual()) {

                throw new RuntimeException(
                        "Gemini response does not contain "
                                + "valid analysisText"
                );
            }

            if (suggestionsNode == null
                    || !suggestionsNode.isTextual()) {

                throw new RuntimeException(
                        "Gemini response does not contain "
                                + "valid suggestions"
                );
            }

            int overallScore =
                    scoreNode.asInt();

            // Make sure score stays between 0 and 100.
            overallScore =
                    Math.max(
                            0,
                            Math.min(
                                    100,
                                    overallScore
                            )
                    );

            List<MicroCategoryDTO> microCategories =
                    new ArrayList<>();

            JsonNode categoriesNode =
                    analysisJson.get("microCategories");

            if (categoriesNode != null
                    && categoriesNode.isArray()) {

                for (JsonNode category :
                        categoriesNode) {

                    JsonNode nameNode =
                            category.get("categoryName");

                    JsonNode scoreCategoryNode =
                            category.get("categoryScore");

                    JsonNode descriptionNode =
                            category.get("categoryDescription");

                    if (nameNode == null
                            || scoreCategoryNode == null
                            || descriptionNode == null) {

                        log.warn(
                                "Skipping incomplete micro-category"
                        );

                        continue;
                    }

                    int categoryScore =
                            scoreCategoryNode.asInt();

                    categoryScore =
                            Math.max(
                                    0,
                                    Math.min(
                                            100,
                                            categoryScore
                                    )
                            );

                    microCategories.add(
                            MicroCategoryDTO.builder()
                                    .categoryName(
                                            nameNode.asText()
                                    )
                                    .categoryScore(
                                            categoryScore
                                    )
                                    .categoryDescription(
                                            descriptionNode.asText()
                                    )
                                    .build()
                    );
                }
            }

            log.info(
                    "Gemini analysis parsed successfully. "
                            + "Actual AI Score: {}",
                    overallScore
            );

            return GeminiAnalysisResult.builder()
                    .overallScore(overallScore)
                    .analysisText(
                            analysisTextNode.asText()
                    )
                    .suggestions(
                            suggestionsNode.asText()
                    )
                    .microCategories(
                            microCategories
                    )
                    .build();

        } catch (Exception e) {

            log.error(
                    "Failed to parse Gemini analysis response: {}",
                    e.getMessage(),
                    e
            );

            throw new RuntimeException(
                    "Gemini returned an invalid analysis response: "
                            + e.getMessage(),
                    e
            );
        }
    }
}