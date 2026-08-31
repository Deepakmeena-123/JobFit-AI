package com.nextstep.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OTPService {

    // Store OTP temporarily (email -> OTP data)
    private final Map<String, OTPData> otpStore = new ConcurrentHashMap<>();

    private static class OTPData {
        String otp;
        LocalDateTime expiryTime;
        int attempts;

        OTPData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
            this.attempts = 0;
        }
    }

    /**
     * Generate a 6-digit OTP
     */
    public String generateOTP() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Generate OTP for signup.
     * LOCAL DEVELOPMENT:
     * OTP is printed in the backend terminal instead of sending email.
     */
    public void sendSignupOTP(String email) {
        String otp = generateOTP();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(10);

        otpStore.put(email, new OTPData(otp, expiryTime));

        log.info("========================================");
        log.info("LOCAL DEVELOPMENT OTP");
        log.info("Email: {}", email);
        log.info("OTP: {}", otp);
        log.info("Expires in: 10 minutes");
        log.info("========================================");
    }

    /**
     * Generate OTP for password reset.
     * LOCAL DEVELOPMENT:
     * OTP is printed in the backend terminal instead of sending email.
     */
    public void sendPasswordResetOTP(String email) {
        String otp = generateOTP();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(10);

        otpStore.put(email, new OTPData(otp, expiryTime));

        log.info("========================================");
        log.info("LOCAL DEVELOPMENT PASSWORD RESET OTP");
        log.info("Email: {}", email);
        log.info("OTP: {}", otp);
        log.info("Expires in: 10 minutes");
        log.info("========================================");
    }

    /**
     * Verify OTP
     */
    public boolean verifyOTP(String email, String otp) {
        OTPData otpData = otpStore.get(email);

        if (otpData == null) {
            log.warn("No OTP found for email: {}", email);
            return false;
        }

        // Check expiry
        if (LocalDateTime.now().isAfter(otpData.expiryTime)) {
            otpStore.remove(email);
            log.warn("OTP expired for email: {}", email);
            return false;
        }

        // Check attempts (max 5)
        if (otpData.attempts >= 5) {
            otpStore.remove(email);
            log.warn("Too many attempts for email: {}", email);
            return false;
        }

        // Verify OTP
        otpData.attempts++;

        if (otpData.otp.equals(otp)) {
            otpStore.remove(email);
            log.info("OTP verified successfully for: {}", email);
            return true;
        }

        log.warn("Invalid OTP attempt for email: {}", email);
        return false;
    }

    /**
     * Generate OTP for account deletion.
     * LOCAL DEVELOPMENT:
     * OTP is printed in the backend terminal instead of sending email.
     */
    public void sendDeleteAccountOTP(String email) {
        String otp = generateOTP();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(10);

        otpStore.put(email, new OTPData(otp, expiryTime));

        log.info("========================================");
        log.info("LOCAL DEVELOPMENT DELETE ACCOUNT OTP");
        log.info("Email: {}", email);
        log.info("OTP: {}", otp);
        log.info("Expires in: 10 minutes");
        log.info("========================================");
    }

    /**
     * Clear OTP for an email
     */
    public void clearOTP(String email) {
        otpStore.remove(email);
    }
}