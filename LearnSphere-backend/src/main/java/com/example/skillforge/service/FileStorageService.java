package com.example.skillforge.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String baseUploadDir;

    /**
     * Returns a subfolder name based on MIME type.
     * Example: "video/mp4" -> "videos"
     */
    public String getSubfolderByMimeType(String contentType) {
        if (contentType == null) return "others";

        if (contentType.startsWith("image/")) {
            return "images";
        } else if (contentType.startsWith("video/")) {
            return "videos";
        } else if (contentType.equals("application/pdf") || contentType.contains("document")) {
            return "documents";
        } else if (contentType.contains("audio")) {
            return "audio";
        } else {
            return "others";
        }
    }

    /**
     * Stores a file locally inside a specific subfolder.
     *
     * @param file      uploaded MultipartFile
     * @param subfolder folder name (e.g., "videos", "images")
     * @return stored file path (relative to base upload dir)
     */
    public String storeFileLocally(MultipartFile file, String subfolder) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Cannot store empty file.");
            }

            // Create base + subfolder path
            Path uploadPath = Paths.get(baseUploadDir, subfolder).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique file name
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = uploadPath.resolve(uniqueFileName);

            // Save file to local path
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path (e.g., "videos/uuid.mp4")
            return subfolder + "/" + uniqueFileName;

        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file: " + ex.getMessage(), ex);
        }
    }

    /**
     * Deletes a file stored locally.
     *
     * @param filePath relative file path (e.g., "videos/uuid.mp4")
     */
    public void deleteFileLocally(String filePath) {
        try {
            Path targetPath = Paths.get(baseUploadDir, filePath).toAbsolutePath().normalize();
            Files.deleteIfExists(targetPath);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to delete file: " + ex.getMessage(), ex);
        }
    }
}
