package com.example.skillforge.controller;

import com.example.skillforge.model.entity.Material;
import com.example.skillforge.model.enums.MaterialType;
import com.example.skillforge.repository.MaterialRepository;
import com.example.skillforge.service.MaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
//@CrossOrigin(origins = "${cors.allowed-origins}")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialService materialService;
    @Autowired
    private MaterialRepository materialRepository;

    /**
     * Upload File Material (e.g., video, pdf, etc.)
     * form-data:
     *  - topicId (text)
     *  - title (text)
     *  - description (text)
     *  - materialType (text)  -> values: VIDEO, PDF, LINK, TEXT
     *  - file (file)
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadMaterial(
            @RequestParam("topicId") Long topicId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("materialType") String materialTypeStr,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("File is empty");
            }

            // Validate material type
            MaterialType materialType;
            try {
                materialType = MaterialType.valueOf(materialTypeStr.toUpperCase());
            } catch (IllegalArgumentException ie) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid materialType. Allowed values: VIDEO, PDF, LINK, TEXT");
            }

            // Validate file size
            long maxSize = materialType == MaterialType.VIDEO ? 500L * 1024 * 1024 : 50L * 1024 * 1024;
            if (file.getSize() > maxSize) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("File too large. Max size: " + (materialType == MaterialType.VIDEO ? "500MB" : "50MB"));
            }

            Material material = materialService.uploadFileMaterial(topicId, title, description, materialType, file);
            return ResponseEntity.ok(material);
        } catch (IllegalArgumentException ie) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid materialType. Allowed values: VIDEO, PDF, LINK, TEXT");
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload material: " + ex.getMessage());
        }
    }

    /**
     * Create Link Material (e.g., YouTube video, Google Drive, etc.)
     * form-data / x-www-form-urlencoded:
     *  - topicId
     *  - title
     *  - description
     *  - link
     */
    @PostMapping("/link")
    public ResponseEntity<?> createLinkMaterial(
            @RequestParam("topicId") Long topicId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("link") String link
    ) {
        try {
            Material material = materialService.createLinkMaterial(topicId, title, description, link);
            return ResponseEntity.ok(material);
        } catch (Exception ex) {
            // log.error("createLinkMaterial failed", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create link material: " + ex.getMessage());
        }
    }

    // Get Materials by Topic
    @GetMapping("/topic/{topicId}")
    public ResponseEntity<?> getMaterialsByTopic(@PathVariable Long topicId) {
        try {
            List<Material> materials = materialService.getMaterialsByTopic(topicId);
            return ResponseEntity.ok(materials);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to get materials: " + ex.getMessage());
        }
    }

    @GetMapping("/view-pdf/{materialId}")
    public ResponseEntity<byte[]> viewPdf(@PathVariable Long materialId) {
        try {
            Material material = materialRepository.findById(materialId)
                    .orElseThrow(() -> new RuntimeException("Material not found"));

            if (!material.getMaterialType().equals(MaterialType.PDF)) {
                throw new RuntimeException("Not a PDF material");
            }

            // ✅ Use Cloudinary SDK to fetch (handles authentication)
            String cloudinaryUrl = material.getFilePath();

            // Extract public_id from URL
            String publicId = extractPublicIdFromUrl(cloudinaryUrl);

            // Fetch from Cloudinary with authentication
            java.net.URL url = new java.net.URL(cloudinaryUrl);
            java.net.HttpURLConnection connection = (java.net.HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);

            int responseCode = connection.getResponseCode();
            System.out.println("Cloudinary Response Code: " + responseCode);

            if (responseCode == 403 || responseCode == 401) {
                throw new RuntimeException("Cannot access Cloudinary file. Check account settings.");
            }

            // Read PDF bytes
            java.io.InputStream inputStream = connection.getInputStream();
            byte[] pdfBytes = inputStream.readAllBytes();
            inputStream.close();

            // Set response headers
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.add("Content-Disposition", "inline; filename=\"" + material.getFileName() + "\"");
            headers.setContentLength(pdfBytes.length);
            headers.setCacheControl("no-cache");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Error: " + e.getMessage()).getBytes());
        }
    }

    // Helper method
    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("/upload/")) {
            return url;
        }
        String[] parts = url.split("/upload/");
        String publicPart = parts[1];
        publicPart = publicPart.replaceFirst("^v[0-9]+/", "");
        if (publicPart.contains(".")) {
            publicPart = publicPart.substring(0, publicPart.lastIndexOf("."));
        }
        return publicPart;
    }


    // Delete Material
    @DeleteMapping("/{materialId}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long materialId) {
        try {
            materialService.deleteMaterial(materialId);
            return ResponseEntity.ok("Material deleted successfully!");
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete material: " + ex.getMessage());
        }
    }
}
