package com.nextstep.controller;

import com.nextstep.model.User;
import com.nextstep.repository.UserRepository;
import com.nextstep.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {
    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/tokens")
    public ResponseEntity<Map<String, Object>> getTokenBalance(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "tokens", user.getTokensRemaining(),
                "monthlyLimit", 100,
                "resetDate", user.getTokensResetDate().toString()
        ));
    }

    @GetMapping("/tokens/refresh")
    public ResponseEntity<Map<String, Object>> refreshTokenBalance(
            @AuthenticationPrincipal User user) {
        // Reload user from database to get latest token count
        User refreshedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "tokens", refreshedUser.getTokensRemaining(),
                "monthlyLimit", 100,
                "resetDate", refreshedUser.getTokensResetDate().toString()
        ));
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "experience", user.getExperience() != null ? user.getExperience() : "",
                "designation", user.getDesignation() != null ? user.getDesignation() : "",
                "currentCompany", user.getCurrentCompany() != null ? user.getCurrentCompany() : ""
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> updates,
            @AuthenticationPrincipal User user) {
        userService.updateUserProfile(user, updates);

        // Return updated user data
        User updatedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "user", Map.of(
                        "userId", updatedUser.getId(),
                        "email", updatedUser.getEmail(),
                        "fullName", updatedUser.getFullName(),
                        "experience", updatedUser.getExperience() != null ? updatedUser.getExperience() : "",
                        "designation", updatedUser.getDesignation() != null ? updatedUser.getDesignation() : "",
                        "currentCompany", updatedUser.getCurrentCompany() != null ? updatedUser.getCurrentCompany() : ""
                )
        ));
    }
}