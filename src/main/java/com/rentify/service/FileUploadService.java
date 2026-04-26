package com.rentify.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;
    
    public FileUploadService() {
        // Ensure upload directory exists on startup
        try {
            java.nio.file.Path uploadPath = java.nio.file.Paths.get(uploadDir);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }
            // Create subdirectories
            java.nio.file.Files.createDirectories(uploadPath.resolve("profiles"));
            java.nio.file.Files.createDirectories(uploadPath.resolve("listings"));
            java.nio.file.Files.createDirectories(uploadPath.resolve("general"));
            java.nio.file.Files.createDirectories(uploadPath.resolve("voice"));
        } catch (Exception e) {
            System.err.println("Warning: Could not create upload directories: " + e.getMessage());
        }
    }
    
    public String uploadFile(MultipartFile file, String subdirectory) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        // Validate file type based on subdirectory
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new RuntimeException("File type cannot be determined");
        }
        
        if ("voice".equals(subdirectory)) {
            // Allow audio files for voice notes
            if (!contentType.startsWith("audio/") && !contentType.equals("application/octet-stream")) {
                throw new RuntimeException("Only audio files are allowed for voice notes");
            }
            // Voice notes can be larger (max 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new RuntimeException("Voice note size exceeds 10MB limit");
            }
        } else {
            // For other uploads, only allow images
            if (!contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed");
            }
            // Images max 5MB
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("File size exceeds 5MB limit");
            }
        }
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, subdirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;
        
        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        // Return URL
        return baseUrl + "/uploads/" + subdirectory + "/" + filename;
    }
    
    public void deleteFile(String fileUrl) {
        try {
            // Extract path from URL
            String path = fileUrl.replace(baseUrl + "/uploads/", "");
            Path filePath = Paths.get(uploadDir, path);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            // Log error but don't throw - file might not exist
            System.err.println("Error deleting file: " + e.getMessage());
        }
    }
}
