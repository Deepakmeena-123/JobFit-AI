package com.nextstep.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {

    private final Tika tika = new Tika();

    /**
     * Extract text directly from MultipartFile without saving to disk
     */
    public String extractTextFromFile(MultipartFile file) {
        try {
            validateResumeFile(file);

            // Extract text directly from input stream (no disk storage)
            try (InputStream inputStream = file.getInputStream()) {
                String text = tika.parseToString(inputStream);
                log.info("Successfully extracted text from file: {}", file.getOriginalFilename());
                return text;
            }
        } catch (Exception e) {
            log.error("Error extracting text from file", e);
            throw new RuntimeException("Failed to extract text from file: " + e.getMessage());
        }
    }

    /**
     * Validate the uploaded file
     */
    private void validateResumeFile(MultipartFile file) {
        // Check if file is empty
        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        // Check file size (5MB limit)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size exceeds 5MB limit");
        }

        // Check file type
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();

        if (filename == null) {
            throw new RuntimeException("Invalid file");
        }

        boolean isPdf = contentType != null && contentType.equals("application/pdf");
        boolean isDocx = contentType != null && (
                contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                        contentType.equals("application/msword")
        );

        boolean hasValidExtension = filename.toLowerCase().endsWith(".pdf") ||
                filename.toLowerCase().endsWith(".docx") ||
                filename.toLowerCase().endsWith(".doc");

        if (!isPdf && !isDocx && !hasValidExtension) {
            throw new RuntimeException("Only PDF and DOCX files are allowed");
        }
    }

    /**
     * DEPRECATED - Keep for backward compatibility but don't use
     * @deprecated Use extractTextFromFile instead
     */
    @Deprecated
    public String saveResumeFile(MultipartFile file, Long userId) {
        log.warn("saveResumeFile is deprecated. Files are now processed in-memory only.");
        return file.getOriginalFilename();
    }

    /**
     * DEPRECATED - Keep for backward compatibility but don't use
     * @deprecated Use extractTextFromFile instead
     */
    @Deprecated
    public String extractTextFromResume(String filename) {
        log.warn("extractTextFromResume(filename) is deprecated. Use extractTextFromFile(MultipartFile) instead.");
        throw new RuntimeException("This method is deprecated. Files are now processed in-memory.");
    }
}