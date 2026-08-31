package com.nextstep.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ChatResponse {
    private Long id;
    private String message;
    private String response;
    private String messageType;
    private LocalDateTime createdAt;
}