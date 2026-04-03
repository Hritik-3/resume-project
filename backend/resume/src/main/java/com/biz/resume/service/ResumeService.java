package com.biz.resume.service;

import com.biz.resume.entity.Resume;
import com.biz.resume.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Value("${file.upload.dir}")
    private String uploadDir;

    /**
     * Upload Resume
     */
    public Resume uploadResume(MultipartFile file) throws IOException {

        // 1. Check empty file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // 2. Validate file size (max 5MB)
        long maxSize = 5 * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new RuntimeException("File size exceeds 5MB");
        }

        // 3. Validate content type
        String contentType = file.getContentType();

        boolean isValidType =
                contentType != null &&
                (contentType.equals("application/pdf") ||
                 contentType.equals("application/msword") ||
                 contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));

        if (!isValidType) {
            throw new RuntimeException("Only PDF/DOC/DOCX files are allowed");
        }

        // 4. Validate file extension
        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || !originalFileName.contains(".")) {
            throw new RuntimeException("Invalid file name");
        }

        String extension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();

        if (!(extension.equals(".pdf") || extension.equals(".doc") || extension.equals(".docx"))) {
            throw new RuntimeException("Invalid file extension");
        }

        // 5. Generate safe unique file name
        String safeFileName = UUID.randomUUID() + extension;

        // 6. Create directory if not exists
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 7. Build file path safely
        Path filePath = uploadPath.resolve(safeFileName);

        // 8. Save file to system
        file.transferTo(filePath.toFile());

        // 9. Save metadata to MongoDB
        Resume resume = new Resume();
        resume.setFileName(originalFileName);
        resume.setFileType(contentType);
        resume.setFilePath(filePath.toString());
        resume.setFileSize(file.getSize());
        resume.setUploadedAt(LocalDateTime.now());

        return resumeRepository.save(resume);
    }

    /**
     * Get all resumes
     */
    public List<Resume> getAllResumes() {
        return resumeRepository.findAll();
    }

    /**
     * Download resume file
     */
    public byte[] downloadResume(String id) throws IOException {

        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        Path filePath = Paths.get(resume.getFilePath());

        if (!Files.exists(filePath)) {
            throw new RuntimeException("File not found on server");
        }

        return Files.readAllBytes(filePath);
    }

    /**
     * Delete resume
     */
    public void deleteResume(String id) {

        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        Path filePath = Paths.get(resume.getFilePath());

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file");
        }

        resumeRepository.deleteById(id);
    }
}