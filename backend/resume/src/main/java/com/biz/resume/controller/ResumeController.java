package com.biz.resume.controller;

import com.biz.resume.entity.Resume;
import com.biz.resume.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    /**
     * Upload API
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            Resume saved = resumeService.uploadResume(file);

            // ✅ Always return JSON
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            // ❌ Avoid plain string → return JSON
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all resumes
     */
    @GetMapping
    public ResponseEntity<List<Resume>> getAllResumes() {
        return ResponseEntity.ok(resumeService.getAllResumes());
    }

    /**
     * Download resume
     */
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadResume(@PathVariable String id) {
        try {
            byte[] fileData = resumeService.downloadResume(id);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=resume.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(fileData);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete resume
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable String id) {
        try {
            resumeService.deleteResume(id);

            // ✅ MUST return JSON (not plain string)
            return ResponseEntity.ok(
                    Map.of("message", "Deleted successfully")
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}