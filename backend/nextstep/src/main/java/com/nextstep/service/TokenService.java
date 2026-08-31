package com.nextstep.service;

import com.nextstep.model.User;
import com.nextstep.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final UserRepository userRepository;

    @Transactional
    public void consumeTokens(User user, int amount) {
        // Reset tokens if month has passed
        if (LocalDateTime.now().isAfter(user.getTokensResetDate())) {
            user.setTokensRemaining(100);
            user.setTokensResetDate(LocalDateTime.now().plusMonths(1));
        }

        if (user.getTokensRemaining() < amount) {
            throw new RuntimeException("Insufficient tokens. You have " +
                    user.getTokensRemaining() + " tokens remaining.");
        }

        user.setTokensRemaining(user.getTokensRemaining() - amount);
        userRepository.save(user);
    }

    public boolean hasTokens(User user, int amount) {
        if (LocalDateTime.now().isAfter(user.getTokensResetDate())) {
            return true; // Will reset on next use
        }
        return user.getTokensRemaining() >= amount;
    }
}