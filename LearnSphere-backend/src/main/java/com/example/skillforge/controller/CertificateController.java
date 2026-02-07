package com.example.skillforge.controller;

import com.example.skillforge.model.entity.Certificate;
import com.example.skillforge.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    // Secured Endpoint (add security annotations as needed, e.g. @PreAuthorize)
    @PostMapping("/generate/{courseId}")
    public ResponseEntity<com.example.skillforge.model.dto.CertificateResponseDTO> generateCertificate(
            @PathVariable Long courseId,
            @RequestParam Long studentId) {

        Certificate cert = certificateService.generateCertificate(studentId, courseId);

        com.example.skillforge.model.dto.CertificateResponseDTO dto = com.example.skillforge.model.dto.CertificateResponseDTO
                .builder()
                .uid(cert.getUid())
                .studentName(cert.getStudentNameSnapshot())
                .courseName(cert.getCourseNameSnapshot())
                .issuedAt(cert.getIssuedAt())
                .pdfUrl(cert.getPdfUrl())
                .build();

        return ResponseEntity.ok(dto);
    }

    // Secured Endpoint
    @GetMapping("/download/{uid}")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String uid) {
        try {
            byte[] pdfBytes = certificateService.generateCertificatePdf(uid);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=certificate-" + uid + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Public Endpoint
    @GetMapping("/public/verify/{uid}")
    public ResponseEntity<com.example.skillforge.model.dto.CertificateResponseDTO> verifyCertificate(
            @PathVariable String uid) {
        Certificate cert = certificateService.getCertificateByUid(uid);

        com.example.skillforge.model.dto.CertificateResponseDTO dto = com.example.skillforge.model.dto.CertificateResponseDTO
                .builder()
                .uid(cert.getUid())
                .studentName(cert.getStudentNameSnapshot()) // Use snapshot, safer than cert.getStudent().getName()
                .courseName(cert.getCourseNameSnapshot()) // Use snapshot
                .issuedAt(cert.getIssuedAt())
                .pdfUrl(cert.getPdfUrl())
                .build();

        return ResponseEntity.ok(dto);
    }
}
