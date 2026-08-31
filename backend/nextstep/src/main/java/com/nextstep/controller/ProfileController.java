package com.nextstep.controller;

import com.nextstep.dto.AnalysisResponse;
import com.nextstep.dto.ProfileSubmissionRequest;
import com.nextstep.model.User;
import com.nextstep.service.AnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin
public class ProfileController {

    private final AnalysisService analysisService;

    @PostMapping("/github")
    public ResponseEntity<AnalysisResponse> submitGithub(
            @RequestBody ProfileSubmissionRequest request,
            @AuthenticationPrincipal User user) {
        AnalysisResponse response = analysisService.analyzeGitHub(request.getGithubUrl(), user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/linkedin")
    public ResponseEntity<AnalysisResponse> submitLinkedIn(
            @RequestBody ProfileSubmissionRequest request,
            @AuthenticationPrincipal User user) {
        AnalysisResponse response = analysisService.analyzeLinkedIn(request.getLinkedinUrl(), user);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalysisResponse> submitResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        AnalysisResponse response = analysisService.analyzeResume(file, user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit-all")
    public ResponseEntity<Map<String, AnalysisResponse>> submitAllProfiles(
            @RequestParam(value = "githubUrl", required = false) String githubUrl,
            @RequestParam(value = "linkedinUrl", required = false) String linkedinUrl,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @AuthenticationPrincipal User user) {

        Map<String, AnalysisResponse> responses = new HashMap<>();

        if (githubUrl != null && !githubUrl.isEmpty()) {
            AnalysisResponse githubResponse = analysisService.analyzeGitHub(githubUrl, user);
            responses.put("github", githubResponse);
        }

        if (linkedinUrl != null && !linkedinUrl.isEmpty()) {
            AnalysisResponse linkedinResponse = analysisService.analyzeLinkedIn(linkedinUrl, user);
            responses.put("linkedin", linkedinResponse);
        }

        if (resume != null && !resume.isEmpty()) {
            AnalysisResponse resumeResponse = analysisService.analyzeResume(resume, user);
            responses.put("resume", resumeResponse);
        }

        return ResponseEntity.ok(responses);
    }
}