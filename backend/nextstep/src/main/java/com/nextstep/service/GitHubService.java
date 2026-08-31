package com.nextstep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.github.api-url}")
    private String githubApiUrl;

    public Map<String, Object> fetchGitHubProfile(String githubUrl) {
        try {
            String username = extractUsernameFromUrl(githubUrl);

            WebClient webClient = webClientBuilder
                    .baseUrl(githubApiUrl)
                    .build();

            Map<String, Object> response = webClient.get()
                    .uri("/users/" + username)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            log.info("Successfully fetched GitHub profile for user: {}", username);
            return response;
        } catch (Exception e) {
            log.error("Error fetching GitHub profile", e);
            throw new RuntimeException("Failed to fetch GitHub profile: " + e.getMessage());
        }
    }

    private String extractUsernameFromUrl(String githubUrl) {
        // Extract username from URLs like:
        // https://github.com/username
        // github.com/username
        String cleaned = githubUrl.replaceAll("https?://", "")
                .replaceAll("www\\.", "")
                .replaceAll("github\\.com/", "");

        String[] parts = cleaned.split("/");
        return parts[0];
    }
}
