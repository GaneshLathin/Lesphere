package com.example.skillforge.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CertificateResponseDTO {
    private String uid;
    private String studentName;
    private String courseName;
    private LocalDateTime issuedAt;
    private String pdfUrl;
}
