package com.nextstep.controller;

import com.nextstep.dto.*;
import com.nextstep.service.GoogleOAuthService;
import com.nextstep.service.OTPService;
import com.nextstep.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final UserService userService;
    private final GoogleOAuthService googleOAuthService;
    private final OTPService otpService;

    /**
     * Send OTP for signup verification
     */
    @PostMapping("/send-signup-otp")
    public ResponseEntity<Map<String, String>> sendSignupOTP(@Valid @RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Check if email already exists
        if (userService.emailExists(email)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered"));
        }

        otpService.sendSignupOTP(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    /**
     * Verify OTP and complete signup
     */
    @PostMapping("/verify-signup-otp")
    public ResponseEntity<AuthResponse> verifySignupOTP(@Valid @RequestBody SignupWithOTPRequest request) {
        // Verify OTP
        if (!otpService.verifyOTP(request.getEmail(), request.getOtp())) {
            return ResponseEntity.badRequest().build();
        }

        // Complete signup
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(request.getEmail());
        signupRequest.setFullName(request.getFullName());
        signupRequest.setPassword(request.getPassword());

        AuthResponse response = userService.signup(signupRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-delete-account-otp")
    public ResponseEntity<Map<String, String>> sendDeleteAccountOTP(
            @Valid @RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (!userService.emailExists(email)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email not found"));
        }

        otpService.sendDeleteAccountOTP(email);
        return ResponseEntity.ok(Map.of("message", "Verification code sent"));
    }

    @PostMapping("/delete-account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @Valid @RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        if (!otpService.verifyOTP(email, otp)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        userService.deleteUserAccount(email);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    /**
     * Traditional login (no change)
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Send OTP for password reset
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Check if email exists
        if (!userService.emailExists(email)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email not found"));
        }

        otpService.sendPasswordResetOTP(email);
        return ResponseEntity.ok(Map.of("message", "Password reset OTP sent"));
    }

    /**
     * Verify OTP and reset password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        // Verify OTP
        if (!otpService.verifyOTP(request.getEmail(), request.getOtp())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid or expired OTP"));
        }

        // Reset password
        userService.resetPassword(request.getEmail(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    /**
     * Google OAuth (no change)
     */
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = googleOAuthService.authenticateWithGoogle(request.getAccessToken());
        return ResponseEntity.ok(response);
    }
}