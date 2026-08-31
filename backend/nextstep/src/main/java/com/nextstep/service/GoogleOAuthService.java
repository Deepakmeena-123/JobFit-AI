package com.nextstep.service;

import com.nextstep.dto.AuthResponse;
import com.nextstep.model.User;
import com.nextstep.repository.UserRepository;
import com.nextstep.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final WebClient.Builder webClientBuilder;

    @Transactional
    public AuthResponse authenticateWithGoogle(String accessToken) {
        try {
            // Verify token with Google
            Map<String, Object> userInfo = getUserInfoFromGoogle(accessToken);

            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub");

            if (email == null || !isEmailVerified(userInfo)) {
                throw new RuntimeException("Email not verified with Google");
            }

            // Find or create user
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createGoogleUser(email, name, googleId));

            // Generate JWT
            String token = jwtUtil.generateToken(user);

            return AuthResponse.builder()
                    .token(token)
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .userId(user.getId())
                    .experience(user.getExperience())
                    .designation(user.getDesignation())
                    .currentCompany(user.getCurrentCompany())
                    .build();

        } catch (Exception e) {
            log.error("Google OAuth authentication failed", e);
            throw new RuntimeException("Google authentication failed: " + e.getMessage());
        }
    }

    private Map getUserInfoFromGoogle(String idToken) {
        WebClient webClient = webClientBuilder.build();

        try {
            return webClient.get()
                    .uri("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            log.error("Failed to verify Google token", e);
            throw new RuntimeException("Google authentication failed: Invalid token");
        }
    }


    private boolean isEmailVerified(Map<String, Object> userInfo) {
        Object verified = userInfo.get("email_verified");

        if (verified instanceof Boolean) {
            return (Boolean) verified;  // correct format
        }

        if (verified instanceof String) {
            return Boolean.parseBoolean((String) verified); // convert "true"/"false" string
        }

        return false; // default
    }

    private User createGoogleUser(String email, String name, String googleId) {
        User user = User.builder()
                .email(email)
                .fullName(name != null ? name : email.split("@")[0])
                .passwordHash("GOOGLE_OAUTH_" + googleId) // No password for OAuth users
                .build();

        return userRepository.save(user);
    }
}