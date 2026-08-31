package com.nextstep.controller;

import com.nextstep.dto.AnalysisResponse;
import com.nextstep.model.User;
import com.nextstep.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@CrossOrigin
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping
    public ResponseEntity<List<AnalysisResponse>> getUserAnalyses(
            @AuthenticationPrincipal User user) {
        List<AnalysisResponse> analyses = analysisService.getUserAnalyses(user);
        return ResponseEntity.ok(analyses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnalysisResponse> getAnalysisById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        AnalysisResponse analysis = analysisService.getAnalysisById(id, user);
        return ResponseEntity.ok(analysis);
    }
}