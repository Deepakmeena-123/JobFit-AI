package com.nextstep.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "Message is required")
    private String message;

    private String messageType; // CAREER_GUIDANCE, CODING_HELP, PROFILE_IMPROVEMENT
}