package com.example.skillforge.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class FileController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @GetMapping("/{folder}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String folder,
            @PathVariable String filename
    ) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(folder).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = determineContentType(filename);
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String determineContentType(String filename) {
        String lowerFilename = filename.toLowerCase();
        
        // Videos
        if (lowerFilename.endsWith(".mp4")) return "video/mp4";
        if (lowerFilename.endsWith(".webm")) return "video/webm";
        if (lowerFilename.endsWith(".avi")) return "video/x-msvideo";
        
        // Documents
        if (lowerFilename.endsWith(".pdf")) return "application/pdf";
        if (lowerFilename.endsWith(".doc")) return "application/msword";
        if (lowerFilename.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        if (lowerFilename.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
        if (lowerFilename.endsWith(".pptx")) return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        
        // Images
        if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) return "image/jpeg";
        if (lowerFilename.endsWith(".png")) return "image/png";
        if (lowerFilename.endsWith(".gif")) return "image/gif";
        
        // Text
        if (lowerFilename.endsWith(".txt")) return "text/plain";
        
        // Default
        return "application/octet-stream";
    }
}
