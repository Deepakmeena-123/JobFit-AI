package com.nextstep.controller;

import com.nextstep.dto.JDMatchResponse;
import com.nextstep.model.User;
import com.nextstep.service.JDMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/jd-match")
@RequiredArgsConstructor
@CrossOrigin
public class JDMatchController {

    private final JDMatchService jdMatchService;

    /**
     * Analyze resume against JD text (pasted)
     */
    @PostMapping(value = "/analyze-text", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JDMatchResponse> analyzeWithText(
            @RequestParam("jdText") String jdText,
            @RequestParam("resume") MultipartFile resumeFile,
            @RequestParam(value = "jobTitle", required = false) String jobTitle,
            @RequestParam(value = "companyName", required = false) String companyName,
            @AuthenticationPrincipal User user) {

        JDMatchResponse response = jdMatchService.analyzeJDMatch(
                jdText, resumeFile, jobTitle, companyName, user
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Analyze resume against JD file (uploaded)
     */
    @PostMapping(value = "/analyze-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JDMatchResponse> analyzeWithFile(
            @RequestParam("jdFile") MultipartFile jdFile,
            @RequestParam("resume") MultipartFile resumeFile,
            @RequestParam(value = "jobTitle", required = false) String jobTitle,
            @RequestParam(value = "companyName", required = false) String companyName,
            @AuthenticationPrincipal User user) {

        JDMatchResponse response = jdMatchService.analyzeJDMatchWithFile(
                jdFile, resumeFile, jobTitle, companyName, user
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get all JD match results for user
     */
    @GetMapping
    public ResponseEntity<List<JDMatchResponse>> getUserMatches(
            @AuthenticationPrincipal User user) {

        List<JDMatchResponse> matches = jdMatchService.getUserMatches(user);
        return ResponseEntity.ok(matches);
    }

    /**
     * Get specific JD match result by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<JDMatchResponse> getMatchById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        JDMatchResponse match = jdMatchService.getMatchById(id, user);
        return ResponseEntity.ok(match);
    }
}