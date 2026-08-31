package com.nextstep.controller;

import com.nextstep.dto.ChatRequest;
import com.nextstep.dto.ChatResponse;
import com.nextstep.model.ChatMessage;
import com.nextstep.model.User;
import com.nextstep.repository.ChatMessageRepository;
import com.nextstep.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin
public class ChatbotController {

    private final GeminiService geminiService;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping
    public ResponseEntity<ChatResponse> sendMessage(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal User user) {

        String response = geminiService.getChatbotResponse(
                request.getMessage(),
                request.getMessageType()
        );

        ChatMessage chatMessage = ChatMessage.builder()
                .user(user)
                .message(request.getMessage())
                .response(response)
                .messageType(request.getMessageType())
                .build();

        chatMessage = chatMessageRepository.save(chatMessage);

        return ResponseEntity.ok(ChatResponse.builder()
                .id(chatMessage.getId())
                .message(chatMessage.getMessage())
                .response(chatMessage.getResponse())
                .messageType(chatMessage.getMessageType())
                .createdAt(chatMessage.getCreatedAt())
                .build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatResponse>> getChatHistory(
            @AuthenticationPrincipal User user) {

        List<ChatMessage> messages = chatMessageRepository
                .findByUserOrderByCreatedAtDesc(user);

        List<ChatResponse> responses = messages.stream()
                .map(msg -> ChatResponse.builder()
                        .id(msg.getId())
                        .message(msg.getMessage())
                        .response(msg.getResponse())
                        .messageType(msg.getMessageType())
                        .createdAt(msg.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }
}