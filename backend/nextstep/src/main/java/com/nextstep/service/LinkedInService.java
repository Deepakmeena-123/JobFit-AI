package com.nextstep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class LinkedInService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.apify.api-url}")
    private String apifyApiUrl;

    @Value("${app.apify.token}")
    private String apifyToken;

    public Map<String, Object> fetchLinkedInProfile(String linkedinUrl) {
        try {
            WebClient webClient = webClientBuilder
                    .baseUrl(apifyApiUrl)
                    .build();

            Map<String, Object> requestBody = Map.of(
                    "username", linkedinUrl,   // pass the LinkedIn profile URL here
                    "includeEmail", false
            );


            List<Map<String, Object>> response = webClient.post()
                    .uri("/acts/apimaestro~linkedin-profile-detail/run-sync-get-dataset-items?token=" + apifyToken)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (response != null && !response.isEmpty()) {
                log.info("Successfully fetched LinkedIn profile");
                return response.get(0);
            }

            throw new RuntimeException("No data returned from LinkedIn scraper");
        } catch (Exception e) {
            log.error("Error fetching LinkedIn profile", e);
            throw new RuntimeException("Failed to fetch LinkedIn profile: " + e.getMessage());
        }
    }
}