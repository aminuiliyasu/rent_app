package com.rentify.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

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

    @Value("${app.aws.s3.bucket-name:}")
    private String s3Bucket;

    @Value("${app.aws.s3.region:us-east-1}")
    private String s3Region;

    @Value("${app.aws.s3.public-base-url:}")
    private String s3PublicBaseUrl;

    @Autowired(required = false)
    private S3Client s3Client;

    public FileUploadService() {
        try {
            Path uploadPath = Paths.get("uploads");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Files.createDirectories(uploadPath.resolve("profiles"));
            Files.createDirectories(uploadPath.resolve("listings"));
            Files.createDirectories(uploadPath.resolve("general"));
            Files.createDirectories(uploadPath.resolve("voice"));
        } catch (Exception e) {
            System.err.println("Warning: Could not create upload directories: " + e.getMessage());
        }
    }

    private boolean useS3() {
        return s3Client != null && s3Bucket != null && !s3Bucket.isBlank();
    }

    public String uploadFile(MultipartFile file, String subdirectory) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new RuntimeException("File type cannot be determined");
        }

        validateFile(file, subdirectory, contentType);

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID() + extension;
        String objectKey = subdirectory + "/" + filename;

        if (useS3()) {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(s3Bucket)
                    .key(objectKey)
                    .contentType(contentType)
                    .build();
            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return buildPublicUrl(objectKey);
        }

        Path uploadPath = Paths.get(uploadDir, subdirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/" + objectKey;
    }

    private void validateFile(MultipartFile file, String subdirectory, String contentType) {
        if ("voice".equals(subdirectory)) {
            if (!contentType.startsWith("audio/") && !contentType.equals("application/octet-stream")) {
                throw new RuntimeException("Only audio files are allowed for voice notes");
            }
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new RuntimeException("Voice note size exceeds 10MB limit");
            }
        } else {
            if (!contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed");
            }
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("File size exceeds 5MB limit");
            }
        }
    }

    private String buildPublicUrl(String objectKey) {
        if (s3PublicBaseUrl != null && !s3PublicBaseUrl.isBlank()) {
            return s3PublicBaseUrl.replaceAll("/$", "") + "/" + objectKey;
        }
        return String.format("https://%s.s3.%s.amazonaws.com/%s", s3Bucket, s3Region, objectKey);
    }

    public void deleteFile(String fileUrl) {
        if (useS3() && fileUrl != null && fileUrl.contains(s3Bucket)) {
            try {
                String key = fileUrl.substring(fileUrl.indexOf(s3Bucket) + s3Bucket.length() + 1);
                if (key.startsWith("/")) {
                    key = key.substring(1);
                }
                final String objectKey = key;
                s3Client.deleteObject(b -> b.bucket(s3Bucket).key(objectKey));
            } catch (Exception e) {
                System.err.println("Error deleting S3 object: " + e.getMessage());
            }
            return;
        }

        try {
            String relative = fileUrl;
            if (relative.startsWith("http://") || relative.startsWith("https://")) {
                relative = java.net.URI.create(relative).getPath();
            }
            if (relative.startsWith(baseUrl + "/uploads/")) {
                relative = relative.substring((baseUrl + "/uploads/").length());
            } else if (relative.startsWith("/uploads/")) {
                relative = relative.substring("/uploads/".length());
            } else {
                return;
            }
            Path filePath = Paths.get(uploadDir, relative.split("/"));
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            System.err.println("Error deleting file: " + e.getMessage());
        }
    }
}
