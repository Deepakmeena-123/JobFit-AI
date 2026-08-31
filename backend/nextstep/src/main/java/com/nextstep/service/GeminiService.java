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

    public GeminiAnalysisResult analyzeGithubProfile(Map<String, Object> githubData, User user) {
        String prompt = buildGithubAnalysisPrompt(githubData, user);
        return callGeminiAPI(prompt);
    }

    public GeminiAnalysisResult analyzeLinkedInProfile(Map<String, Object> linkedinData, User user) {
        String prompt = buildLinkedInAnalysisPrompt(linkedinData, user);
        return callGeminiAPI(prompt);
    }

    public GeminiAnalysisResult analyzeResume(String resumeText, User user) {
        String prompt = buildResumeAnalysisPrompt(resumeText, user);
        return callGeminiAPI(prompt);
    }

    public String getChatbotResponse(String userMessage, String messageType) {
        String prompt = buildChatbotPrompt(userMessage, messageType);

        try {
            String response = callGeminiChatAPI(prompt);
            return response;
        } catch (Exception e) {
            log.error("Error getting chatbot response", e);
            return "I apologize, but I'm having trouble processing your request right now. Please try again.";
        }
    }

    private String buildGithubAnalysisPrompt(Map<String, Object> data, User user) {
        String userContext = buildUserContext(user);
        return String.format("""
            Analyze this GitHub profile data and provide a structured JSON response with the following format:
            {
              "overallScore": <score 0-100>,
              "analysisText": "<detailed analysis paragraph>",
              "suggestions": "<actionable improvement suggestions>",
              "microCategories": [
                {"categoryName": "Profile Completeness", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Repository Quality", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Activity Level", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Community Engagement", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Code Quality", "categoryScore": <0-100>, "categoryDescription": "<description>"}
              ]
            }
            
            GitHub Data:
            - Public Repos: %s
            - Followers: %s
            - Following: %s
            - Bio: %s
            - Location: %s
            - Company: %s
            - Blog/Website: %s
            
            Provide honest, constructive feedback focusing on professional development.
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

    private String buildLinkedInAnalysisPrompt(Map<String, Object> data, User user) {
        String userContext = buildUserContext(user);
        return String.format("""
            Analyze this LinkedIn profile data and provide a structured JSON response with the following format:
            {
              "overallScore": <score 0-100>,
              "analysisText": "<detailed analysis paragraph>",
              "suggestions": "<actionable improvement suggestions>",
              "microCategories": [
                {"categoryName": "Profile Completeness", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Professional Branding", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Network Size", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Content Quality", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Skills & Endorsements", "categoryScore": <0-100>, "categoryDescription": "<description>"}
              ]
            }
            
            LinkedIn Data:
            %s
            
            Provide honest, constructive feedback focusing on professional branding and networking.
            """,
                data.toString()
        );
    }

    private String buildResumeAnalysisPrompt(String resumeText, User user) {
        String userContext = buildUserContext(user);
        return String.format("""
            Analyze this resume and provide a structured JSON response with the following format:
            {
              "overallScore": <score 0-100>,
              "analysisText": "<detailed analysis paragraph>",
              "suggestions": "<actionable improvement suggestions>",
              "microCategories": [
                {"categoryName": "Format & Structure", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Content Quality", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Skills Presentation", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Experience Description", "categoryScore": <0-100>, "categoryDescription": "<description>"},
                {"categoryName": "Impact & Achievements", "categoryScore": <0-100>, "categoryDescription": "<description>"}
              ]
            }
            
            Resume Text:
            %s
            
            Evaluate based on ATS compatibility, clarity, impact, and professional standards.
            """,
                resumeText
        );
    }

    private String buildChatbotPrompt(String userMessage, String messageType) {
        String context = switch (messageType) {
            case "CAREER_GUIDANCE" -> "You are a career counselor providing professional guidance.";
            case "CODING_HELP" -> "You are a coding mentor helping with programming questions.";
            case "PROFILE_IMPROVEMENT" -> "You are a personal branding expert helping improve professional profiles.";
            default -> "You are a helpful AI assistant focused on career development.";
        };

        return String.format("%s\n\nUser Question: %s\n\nProvide a helpful, concise response.",
                context, userMessage);
    }

    private String buildUserContext(User user) {
        StringBuilder context = new StringBuilder("USER PROFILE CONTEXT:\n");

        if (user.getExperience() != null && !user.getExperience().isEmpty()) {
            context.append("- Experience Level: ").append(user.getExperience()).append("\n");
        }

        if (user.getDesignation() != null && !user.getDesignation().isEmpty()) {
            context.append("- Current Role: ").append(user.getDesignation()).append("\n");
        }

        if (user.getCurrentCompany() != null && !user.getCurrentCompany().isEmpty()) {
            context.append("- Current Company: ").append(user.getCurrentCompany()).append("\n");
        }

        if (context.length() > "USER PROFILE CONTEXT:\n".length()) {
            context.append("\nUse this context to provide more personalized and relevant analysis.\n");
            return context.toString();
        }

        return "";
    }

    private GeminiAnalysisResult callGeminiAPI(String prompt) {
        try {
            WebClient webClient = webClientBuilder
                    .baseUrl(geminiApiUrl)
                    .build();

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
                    .retryWhen(Retry.backoff(3, Duration.ofSeconds(2))
                            .filter(throwable -> throwable instanceof WebClientResponseException.TooManyRequests)
                            .doBeforeRetry(retrySignal ->
                                    log.warn("Retrying Gemini API call, attempt: {}", retrySignal.totalRetries() + 1)
                            )
                    )
                    .timeout(Duration.ofSeconds(30))
                    .block();

            return parseGeminiResponse(response);
        } catch (WebClientResponseException.TooManyRequests e) {
            log.error("Rate limit exceeded for Gemini API", e);
            throw new RuntimeException("AI service is currently rate limited. Please try again in a few moments.");
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return createDefaultAnalysisResult();
        }
    }

    private String callGeminiChatAPI(String prompt) {
        try {
            WebClient webClient = webClientBuilder
                    .baseUrl(geminiApiUrl)
                    .build();

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

            JsonNode jsonNode = objectMapper.readTree(response);
            return jsonNode.at("/candidates/0/content/parts/0/text").asText();
        } catch (Exception e) {
            log.error("Error calling Gemini Chat API", e);
            throw new RuntimeException("Failed to get chatbot response", e);
        }
    }

    private GeminiAnalysisResult parseGeminiResponse(String response) {
        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            String textContent = jsonNode.at("/candidates/0/content/parts/0/text").asText();

            // Extract JSON from markdown code blocks if present
            textContent = textContent.replaceAll("```json\\s*", "").replaceAll("```\\s*$", "").trim();

            JsonNode analysisJson = objectMapper.readTree(textContent);

            List<MicroCategoryDTO> microCategories = new ArrayList<>();
            JsonNode categoriesNode = analysisJson.get("microCategories");
            if (categoriesNode != null && categoriesNode.isArray()) {
                for (JsonNode category : categoriesNode) {
                    microCategories.add(MicroCategoryDTO.builder()
                            .categoryName(category.get("categoryName").asText())
                            .categoryScore(category.get("categoryScore").asInt())
                            .categoryDescription(category.get("categoryDescription").asText())
                            .build());
                }
            }

            return GeminiAnalysisResult.builder()
                    .overallScore(analysisJson.get("overallScore").asInt())
                    .analysisText(analysisJson.get("analysisText").asText())
                    .suggestions(analysisJson.get("suggestions").asText())
                    .microCategories(microCategories)
                    .build();
        } catch (Exception e) {
            log.error("Error parsing Gemini response", e);
            return createDefaultAnalysisResult();
        }
    }

    private GeminiAnalysisResult createDefaultAnalysisResult() {
        return GeminiAnalysisResult.builder()
                .overallScore(50)
                .analysisText("Unable to complete analysis at this time.")
                .suggestions("Please try again later.")
                .microCategories(new ArrayList<>())
                .build();
    }
}