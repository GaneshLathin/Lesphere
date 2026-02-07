package com.example.skillforge.service;

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
public class LocalStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${server.port:8081}")
    private String serverPort;

    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir, folder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return URL to access the file
        return "http://localhost:" + serverPort + "/api/files/" + folder + "/" + fileName;
    }

    public void deleteFile(String url) {
        try {
            if (url == null || !url.contains("/api/files/")) return;

            // Extract path from URL
            String path = url.substring(url.indexOf("/api/files/") + 11);
            Path filePath = Paths.get(uploadDir, path);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            // Log error but don't throw exception
            System.err.println("Failed to delete file: " + url + " - " + e.getMessage());
        }
    }
}
