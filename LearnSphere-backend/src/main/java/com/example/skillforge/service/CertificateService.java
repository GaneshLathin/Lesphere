// package com.example.skillforge.service;

// import com.example.skillforge.model.entity.*;
// import com.example.skillforge.repository.*;
// import com.itextpdf.text.*;
// import com.itextpdf.text.pdf.PdfWriter;
// import com.itextpdf.text.pdf.PdfContentByte;
// import com.itextpdf.text.pdf.ColumnText;
// import com.itextpdf.text.pdf.PdfPTable;
// import com.itextpdf.text.pdf.PdfPCell;
// import com.google.zxing.BarcodeFormat;
// import com.google.zxing.client.j2se.MatrixToImageWriter;
// import com.google.zxing.common.BitMatrix;
// import com.google.zxing.qrcode.QRCodeWriter;
// import com.itextpdf.text.pdf.BaseFont;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.io.ByteArrayOutputStream;
// import java.time.format.DateTimeFormatter;
// import java.util.UUID;
// import java.util.Optional;

// @Service
// public class CertificateService {

//         @Autowired
//         private CertificateRepository certificateRepository;

//         @Autowired
//         private CourseRepository courseRepository;

//         @Autowired
//         private UserRepository userRepository; // To fetch user details

//         @Autowired
//         private CompletionService completionService;

//         @org.springframework.beans.factory.annotation.Value("${skillforge.verification.base-url:http://localhost:5173/verify/}")
//         private String verificationBaseUrl;

//         // private static final String VERIFICATION_BASE_URL =
//         // "http://localhost:5173/verify/";

//         @Transactional
//         public Certificate generateCertificate(Long studentId, Long courseId) {
//                 // 1. Check idempotency
//                 Optional<Certificate> existingCert = certificateRepository.findByStudentIdAndCourseId(studentId,
//                                 courseId);
//                 if (existingCert.isPresent()) {
//                         return existingCert.get();
//                 }

//                 // 2. Validate Completion
//                 // While CompletionService.checkCourseCompletion updates progress, we should
//                 // verify it returns true
//                 // Or check the CourseProgress entity. Assuming CheckCourseCompletion is
//                 // idempotent and returns true if complete.
//                 boolean isComplete = completionService.checkCourseCompletion(studentId, courseId);
//                 if (!isComplete) {
//                         throw new RuntimeException("Course is not completed yet. Cannot generate certificate.");
//                 }

//                 // 3. Fetch Data
//                 User student = userRepository.findById(studentId)
//                                 .orElseThrow(() -> new RuntimeException("Student not found"));
//                 Course course = courseRepository.findById(courseId)
//                                 .orElseThrow(() -> new RuntimeException("Course not found"));

//                 // 4. Create Certificate Entity
//                 Certificate certificate = Certificate.builder()
//                                 .student(student)
//                                 .course(course)
//                                 .uid(UUID.randomUUID().toString())
//                                 .studentNameSnapshot(student.getName()) // Assuming User has getName()
//                                 .courseNameSnapshot(course.getTitle())
//                                 .build();

//                 return certificateRepository.save(certificate);
//         }

//         public byte[] generateCertificatePdf(String uid) throws Exception {
//                 Certificate cert = certificateRepository.findByUid(uid)
//                                 .orElseThrow(() -> new RuntimeException("Certificate not found"));

//                 // 1. Setup Document
//                 Document document = new Document(PageSize.A4.rotate());
//                 ByteArrayOutputStream out = new ByteArrayOutputStream();
//                 PdfWriter writer = PdfWriter.getInstance(document, out);
//                 document.open();

//                 PdfContentByte canvas = writer.getDirectContent();

//                 // 2. Draw Borders (Elegant Rounded Style)
//                 drawElegantBorder(canvas, PageSize.A4.rotate());

//                 // 3. Fonts & Colors
//                 BaseColor skillForgeBlue = new BaseColor(0, 124, 195); // SkillForge Blue
//                 BaseColor skillForgeDark = new BaseColor(0, 80, 130);
//                 BaseColor darkText = new BaseColor(60, 60, 60);
//                 BaseColor redText = new BaseColor(220, 50, 50);

//                 // Fonts
//                 Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 38, skillForgeBlue);
//                 Font titleFont = FontFactory.getFont(FontFactory.HELVETICA, 24, skillForgeBlue);
//                 Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 42, skillForgeDark);
//                 Font textFont = FontFactory.getFont(FontFactory.HELVETICA, 16, darkText);
//                 Font boldTextFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, darkText);
//                 Font congratsFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 14, redText);
//                 Font smallTextFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.GRAY);
//                 Font signatureNameFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 18, skillForgeBlue);

//                 // 4. Content Positioning (Center X = 421)
//                 float centerX = 421;
//                 float topMargin = 500; // Leaving space for top border

//                 // TOP BRANDING: "SkillForge" (High visibility)
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("SkillForge", headerFont), centerX, topMargin, 0);

//                 // CERTIFICATE TITLE
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("COURSE COMPLETION CERTIFICATE", titleFont), centerX, 440, 0);

//                 // AWARDEE INTRO
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("The certificate is awarded to", textFont), centerX, 390, 0);

//                 // STUDENT NAME
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase(cert.getStudentNameSnapshot(), nameFont), centerX, 330, 0);

//                 // COMPLETION TEXT
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("for successfully completing the course", textFont), centerX, 280, 0);

//                 // COURSE NAME
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase(cert.getCourseNameSnapshot(), boldTextFont), centerX, 250, 0);

//                 // DATE
//                 String dateStr = cert.getIssuedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("on " + dateStr, textFont), centerX, 220, 0);

//                 // BOTTOM BRANDING
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("SkillForge Learning Platform",
//                                                 FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, skillForgeBlue)),
//                                 centerX, 180, 0);

//                 // CONGRATULATIONS
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("Congratulations! You make us proud!", congratsFont), centerX, 150, 0);

//                 // QR CODE SECTION (Bottom Left)
//                 // Position: Inset 70.
//                 // Image Y: 70 to 150 (Height 80). Center X of QR Image (80w) is 70 + 40 = 110.
//                 // Text Y: 60, 50.
//                 String verifyUrl = verificationBaseUrl + cert.getUid();
//                 Image qrCode = generateQrCodeImage(verifyUrl);
//                 qrCode.scaleAbsolute(80, 80);
//                 qrCode.setAbsolutePosition(70, 70);
//                 document.add(qrCode);

//                 ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT,
//                                 new Phrase("Issued: " + dateStr, smallTextFont), 70, 60, 0);
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT,
//                                 new Phrase("ID: " + cert.getUid(), smallTextFont), 70, 50, 0);

//                 // SIGNATURE SECTION (Bottom Right)
//                 // Alignment:
//                 // 1. Horizontal: Mirror QR Center (110 from Left).
//                 // Right Center = 842 - 110 = 732.
//                 // 2. Vertical:
//                 // Top Aligned with QR Top (150). Name Baseline 135.
//                 // Bottom Aligned with QR Bottom (50). Org Baseline 50.
//                 // Title centered in between ~92.
//                 float sigX = 732;
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("Gowtham B", signatureNameFont), sigX, 135, 0);
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("Authorized Signatory", smallTextFont), sigX, 92, 0);
//                 ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
//                                 new Phrase("SkillForge Learning Platform", smallTextFont), sigX, 50, 0);

//                 document.close();
//                 return out.toByteArray();
//         }

//         private void drawElegantBorder(PdfContentByte canvas, Rectangle pageSize) {
//                 float x = 20; // Margin X
//                 float y = 20; // Margin Y
//                 float w = pageSize.getWidth() - 40; // Width
//                 float h = pageSize.getHeight() - 40; // Height

//                 // Radius for inward cut "ticket" corner
//                 float rOuter = 12;
//                 float gap = 7;

//                 // Color: Professional Dark Blue-Gray
//                 BaseColor borderColor = new BaseColor(60, 75, 90);

//                 canvas.setColorStroke(borderColor);
//                 canvas.setColorFill(borderColor);

//                 // 1. Outer Border (Concave/Ticket Corners)
//                 canvas.setLineWidth(2.0f);
//                 drawInvertedRoundedRect(canvas, x, y, w, h, rOuter);
//                 canvas.stroke();

//                 // // 2. Inner Border (Sharp/Rectangular)
//                 // canvas.setLineWidth(0.8f);
//                 // canvas.rectangle(x + gap, y + gap, w - 2 * gap, h - 2 * gap);
//                 // canvas.stroke();

//                 // 2. Inner Border (Curved – Matches Outer Style)
//                 canvas.setLineWidth(0.8f);

//                 // Smaller radius for inner curve
//                 float rInner = rOuter - 6;

//                 // Draw curved inner border
//                 drawInvertedRoundedRect(
//                                 canvas,
//                                 x + gap,
//                                 y + gap,
//                                 w - 2 * gap,
//                                 h - 2 * gap,
//                                 rInner);
//                 canvas.stroke();

//                 // 3. Corner Dots
//                 // Placed in the "cutout" void.
//                 // The logical sharp corner is at (x, y).
//                 // The border arc recedes towards (x+r, y+r).
//                 // We place the dot near (x+d, y+d).
//                 float dotRadius = 1.8f;
//                 float dotMargin = 4.0f; // Very close to the corner

//                 // Bottom-Left
//                 canvas.circle(x + dotMargin, y + dotMargin, dotRadius);
//                 // Bottom-Right
//                 canvas.circle(x + w - dotMargin, y + dotMargin, dotRadius);
//                 // Top-Left
//                 canvas.circle(x + dotMargin, y + h - dotMargin, dotRadius);
//                 // Top-Right
//                 canvas.circle(x + w - dotMargin, y + h - dotMargin, dotRadius);

//                 canvas.fill();
//         }

//         private void drawInvertedRoundedRect(PdfContentByte canvas, float x, float y, float w, float h, float r) {
//                 // Draws a rectangle with "Ticket-Punch" Concave corners
//                 // The Arc centers are at the corners of the rectangle.
//                 float k = 0.552284749831f;
//                 float kr = k * r;

//                 // Move to Bottom-Left start (After corner)
//                 canvas.moveTo(x + r, y);

//                 // Bottom Line
//                 canvas.lineTo(x + w - r, y);

//                 // BR Corner (Concave)
//                 // Center (x+w, y). Start (x+w-r, y). End (x+w, y+r).
//                 // P0 relative to center is (-r, 0). P3 relative to center is (0, r).
//                 // CP1 = P0 + (0, kr) = (x+w-r, y+kr).
//                 // CP2 = P3 + (-kr, 0) = (x+w-kr, y+r).
//                 canvas.curveTo(x + w - r, y + kr, x + w - kr, y + r, x + w, y + r);

//                 // Right Line
//                 canvas.lineTo(x + w, y + h - r);

//                 // TR Corner (Concave)
//                 // Center (x+w, y+h). Start (x+w, y+h-r). End (x+w-r, y+h).
//                 // P0 relative to center is (0, -r). P3 relative to center is (-r, 0).
//                 // CP1 = P0 + (-kr, 0) = (x+w-kr, y+h-r).
//                 // CP2 = P3 + (0, -kr) = (x+w-r, y+h-kr).
//                 canvas.curveTo(x + w - kr, y + h - r, x + w - r, y + h - kr, x + w - r, y + h);

//                 // Top Line
//                 canvas.lineTo(x + r, y + h);

//                 // TL Corner (Concave)
//                 // Center (x, y+h). Start (x+r, y+h). End (x, y+h-r).
//                 // P0 relative to center is (r, 0). P3 relative to center is (0, -r).
//                 // CP1 = P0 + (0, -kr) = (x+r, y+h-kr).
//                 // CP2 = P3 + (kr, 0) = (x+kr, y+h-r).
//                 canvas.curveTo(x + r, y + h - kr, x + kr, y + h - r, x, y + h - r);

//                 // Left Line
//                 canvas.lineTo(x, y + r);

//                 // BL Corner (Concave)
//                 // Center (x, y). Start (x, y+r). End (x+r, y).
//                 // P0 relative to center is (0, r). P3 relative to center is (r, 0).
//                 // CP1 = P0 + (kr, 0) = (x+kr, y+r).
//                 // CP2 = P3 + (0, kr) = (x+r, y+kr).
//                 canvas.curveTo(x + kr, y + r, x + r, y + kr, x + r, y);
//         }

//         private Image generateQrCodeImage(String text) throws Exception {
//                 QRCodeWriter qrCodeWriter = new QRCodeWriter();
//                 BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, 150, 150);
//                 ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
//                 MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
//                 return Image.getInstance(pngOutputStream.toByteArray());
//         }
//         private void drawRoundedRect(PdfContentByte canvas,
//                              float x, float y, float w, float h, float r) {

//     float k = 0.552284749831f;
//     float kr = k * r;

//     canvas.moveTo(x + r, y);

//     // Bottom
//     canvas.lineTo(x + w - r, y);
//     canvas.curveTo(x + w - r + kr, y, x + w, y + r - kr, x + w, y + r);

//     // Right
//     canvas.lineTo(x + w, y + h - r);
//     canvas.curveTo(x + w, y + h - r + kr, x + w - r + kr, y + h, x + w - r, y + h);

//     // Top
//     canvas.lineTo(x + r, y + h);
//     canvas.curveTo(x + r - kr, y + h, x, y + h - r + kr, x, y + h - r);

//     // Left
//     canvas.lineTo(x, y + r);
//     canvas.curveTo(x, y + r - kr, x + r - kr, y, x + r, y);
// }

//         public Certificate getCertificateByUid(String uid) {
//                 return certificateRepository.findByUid(uid)
//                                 .orElseThrow(() -> new RuntimeException("Certificate not found"));
//         }
// }

package com.example.skillforge.service;

import com.example.skillforge.model.entity.*;
import com.example.skillforge.repository.*;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Service
public class CertificateService {

        @Autowired
        private CertificateRepository certificateRepository;

        @Autowired
        private CourseRepository courseRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private CompletionService completionService;

        @Autowired
        private StudentRepository studentRepository;

        @Autowired
        private EnrollmentRepository enrollmentRepository;

        @org.springframework.beans.factory.annotation.Value("${skillforge.verification.base-url:http://localhost:5173/verify/}")
        private String verificationBaseUrl;

        @Transactional
        public Certificate generateCertificate(Long userId, Long courseId) {
                // 1. Resolve User/Student
                // The parameter passed is actually the User ID (from JWT/Frontend) not the
                // Student ID (PK)
                // So we look up the student by USER ID.
                Student studentEntity = studentRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Student entity not found for User ID: " + userId));
                User user = studentEntity.getUser();

                // 2. Validate Completion via Enrollment (Source of Truth)
                Enrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentEntity.getId(), courseId)
                                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

                if (!Boolean.TRUE.equals(enrollment.getIsCompleted())) {
                        if (enrollment.getCompletionPercentage() != null
                                        && enrollment.getCompletionPercentage() == 100) {
                                // Fix data inconsistency: Progress is 100% but flag is false. Update flag.
                                enrollment.setIsCompleted(true);
                                enrollment.setCompletedAt(java.time.LocalDateTime.now());
                                enrollmentRepository.save(enrollment);
                        } else {
                                throw new RuntimeException("Course is not completed yet.");
                        }
                }

                // Check idempotency using the USER ID (since Certificate links to User)
                Optional<Certificate> existingCert = certificateRepository.findByStudentIdAndCourseId(user.getId(),
                                courseId);
                if (existingCert.isPresent())
                        return existingCert.get();

                Course course = courseRepository.findById(courseId)
                                .orElseThrow(() -> new RuntimeException("Course not found"));

                Certificate certificate = Certificate.builder()
                                .student(user)
                                .course(course)
                                .uid(UUID.randomUUID().toString())
                                .studentNameSnapshot(user.getName())
                                .courseNameSnapshot(course.getTitle())
                                .build();

                return certificateRepository.save(certificate);
        }

        @Transactional
        public byte[] generateCertificatePdf(String uid) throws Exception {

                Certificate cert = certificateRepository.findByUid(uid)
                                .orElseThrow(() -> new RuntimeException("Certificate not found"));

                Document document = new Document(PageSize.A4.rotate());
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                PdfWriter writer = PdfWriter.getInstance(document, out);
                document.open();

                PdfContentByte canvas = writer.getDirectContent();

                // ===== BORDER =====
                drawElegantBorder(canvas, PageSize.A4.rotate());

                // ===== COLORS =====
                BaseColor blue = new BaseColor(0, 124, 195);
                BaseColor darkBlue = new BaseColor(0, 80, 130);
                BaseColor darkText = new BaseColor(60, 60, 60);
                BaseColor red = new BaseColor(220, 50, 50);

                // ===== FONTS =====
                Font header = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 38, blue);
                Font title = FontFactory.getFont(FontFactory.HELVETICA, 24, blue);
                Font name = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 42, darkBlue);
                Font text = FontFactory.getFont(FontFactory.HELVETICA, 16, darkText);
                Font bold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, darkText);
                Font congrats = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 14, red);
                Font small = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.GRAY);
                Font signFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 18, blue);

                float cx = 421;

                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER, new Phrase("LearnSphere-Platform", header), cx,
                                500, 0);
                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                                new Phrase("COURSE COMPLETION CERTIFICATE", title), cx, 440, 0);
                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                                new Phrase("The certificate is awarded to", text), cx, 390, 0);
                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                                new Phrase(cert.getStudent().getName(), name), cx, 330, 0);
                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                                new Phrase("for successfully completing the course", text), cx, 280, 0);
                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                                new Phrase(cert.getCourseNameSnapshot(), bold), cx, 250, 0);

                String dateStr = cert.getIssuedAt().format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                                new Phrase("on " + dateStr, text), cx, 220, 0);

                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                                new Phrase("LearnSphere-Platform Learning Platform",
                                                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, blue)),
                                cx, 180, 0);

                ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                                new Phrase("Congratulations! You make us proud!", congrats), cx, 150, 0);

                // ===== QR =====
                Image qr = generateQrCodeImage(verificationBaseUrl + cert.getUid());
                qr.scaleAbsolute(80, 80);
                qr.setAbsolutePosition(70, 70);
                document.add(qr);

                ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT,
                                new Phrase("Issued: " + dateStr, small), 70, 60, 0);
                ColumnText.showTextAligned(canvas, Element.ALIGN_LEFT,
                                new Phrase("ID: " + cert.getUid(), small), 70, 50, 0);

                // ===== SIGNATURE =====
                // float sigX = 732;
                // ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                // new Phrase("Gowtham B", signFont), sigX, 150, 0);
                // ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                // new Phrase("Authorized Signatory", small), sigX, 115, 0);
                // ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER,
                // new Phrase("SkillForge Learning Platform", small), sigX, 50, 0);
                // ===== SIGNATURE IMAGE =====
                // Image signImg = Image.getInstance(
                // getClass().getResource("/signature/gowtham-sign.png"));
                // signImg.scaleAbsolute(120, 45); // width x height
                // signImg.setAbsolutePosition(
                // PageSize.A4.rotate().getWidth() - 190, 150); // right-aligned
                // document.add(signImg);

                // ===== SIGNATURE (FINAL FINE-TUNED POSITION) =====

                // // Same QR inset
                // float rightInset = 70;
                // float pageWidth = PageSize.A4.rotate().getWidth();

                // // ⬅️ Move LEFT by increasing block width effect
                // float sigCenterX = pageWidth - (rightInset + 65); // was 40 → now 45

                // // ⬇️ Move DOWN slightly
                // float sigBaseY = 110; // was 130 → now 120

                // // Signature name (italic, professional)
                // Font signNameFont = FontFactory.getFont(
                // FontFactory.HELVETICA_OBLIQUE, 16, darkBlue);

                // ColumnText.showTextAligned(
                // canvas,
                // Element.ALIGN_CENTER,
                // new Phrase("Gowtham B", signNameFont),
                // sigCenterX,
                // sigBaseY,
                // 0
                // );

                // // Designation
                // ColumnText.showTextAligned(
                // canvas,
                // Element.ALIGN_CENTER,
                // new Phrase("Authorized Signatory", small),
                // sigCenterX,
                // sigBaseY - 18,
                // 0
                // );

                // // Organization
                // ColumnText.showTextAligned(
                // canvas,
                // Element.ALIGN_CENTER,
                // new Phrase("SkillForge Learning Platform", small),
                // sigCenterX,
                // sigBaseY - 34,
                // 0
                // );
                float rightInset = 70;
                float pageWidth = PageSize.A4.rotate().getWidth();

                // Center of signature block (mirror of QR)
                float sigCenterX = pageWidth - (rightInset + 60);

                // Base line for NAME
                float sigBaseY = 100;

                Image signImg = Image.getInstance(
                                getClass().getResource("/signature/gowtham-sign.png"));

                float imgWidth = 100;
                float imgHeight = 35;

                signImg.scaleAbsolute(imgWidth, imgHeight);

                // ⬆️ Image ABOVE name (important)
                float imgX = sigCenterX - (imgWidth / 2);
                float imgY = sigBaseY + 15;
                // float imgY = 145;

                signImg.setAbsolutePosition(imgX, imgY);
                document.add(signImg);

                Font signNameFont = FontFactory.getFont(
                                FontFactory.HELVETICA_OBLIQUE, 16, darkBlue);

                // Name
                ColumnText.showTextAligned(
                                canvas,
                                Element.ALIGN_CENTER,
                                new Phrase("Gowtham B", signNameFont),
                                sigCenterX,
                                sigBaseY,
                                0);

                // Designation
                ColumnText.showTextAligned(
                                canvas,
                                Element.ALIGN_CENTER,
                                new Phrase("Authorized Signatory", small),
                                sigCenterX,
                                sigBaseY - 18,
                                0);

                // Organization
                ColumnText.showTextAligned(
                                canvas,
                                Element.ALIGN_CENTER,
                                new Phrase("LearnSphere-Platform Learning Platform", small),
                                sigCenterX,
                                sigBaseY - 34,
                                0);

                document.close();
                return out.toByteArray();
        }

        // ================= BORDER METHODS =================

        private void drawElegantBorder(PdfContentByte canvas, Rectangle page) {

                float x = 20, y = 20;
                float w = page.getWidth() - 40;
                float h = page.getHeight() - 40;

                // float rOuter = 12;
                // float gap = 7;
                // float rInner = 5;
                float rOuter = 12;
                float gap = 6; // increase gap slightly
                float rInner = 10; // inner curve almost same as outer

                BaseColor color = new BaseColor(60, 75, 90);
                canvas.setColorStroke(color);
                canvas.setColorFill(color);

                // Outer (Concave)
                canvas.setLineWidth(2f);
                drawInvertedRoundedRect(canvas, x, y, w, h, rOuter);
                canvas.closePath();
                canvas.stroke();

                // Inner (Convex)
                canvas.setLineWidth(1.0f);
                drawInvertedRoundedRect(canvas, x + gap, y + gap, w - 2 * gap, h - 2 * gap, rInner);
                canvas.closePath();
                canvas.stroke();

                // Corner dots
                float d = 3, r = 1.8f;
                canvas.circle(x + d, y + d, r);
                canvas.circle(x + w - d, y + d, r);
                canvas.circle(x + d, y + h - d, r);
                canvas.circle(x + w - d, y + h - d, r);
                canvas.fill();
        }

        private void drawInvertedRoundedRect(PdfContentByte c, float x, float y, float w, float h, float r) {
                float k = 0.552284749831f, kr = k * r;

                c.moveTo(x + r, y);
                c.lineTo(x + w - r, y);
                c.curveTo(x + w - r, y + kr, x + w - kr, y + r, x + w, y + r);
                c.lineTo(x + w, y + h - r);
                c.curveTo(x + w - kr, y + h - r, x + w - r, y + h - kr, x + w - r, y + h);
                c.lineTo(x + r, y + h);
                c.curveTo(x + r, y + h - kr, x + kr, y + h - r, x, y + h - r);
                c.lineTo(x, y + r);
                c.curveTo(x + kr, y + r, x + r, y + kr, x + r, y);
        }

        private void drawRoundedRect(PdfContentByte c, float x, float y, float w, float h, float r) {
                float k = 0.552284749831f, kr = k * r;

                c.moveTo(x + r, y);
                c.lineTo(x + w - r, y);
                c.curveTo(x + w - r + kr, y, x + w, y + r - kr, x + w, y + r);
                c.lineTo(x + w, y + h - r);
                c.curveTo(x + w, y + h - r + kr, x + w - r + kr, y + h, x + w - r, y + h);
                c.lineTo(x + r, y + h);
                c.curveTo(x + r - kr, y + h, x, y + h - r + kr, x, y + h - r);
                c.lineTo(x, y + r);
                c.curveTo(x, y + r - kr, x + r - kr, y, x + r, y);
        }

        private Image generateQrCodeImage(String text) throws Exception {
                QRCodeWriter writer = new QRCodeWriter();
                BitMatrix matrix = writer.encode(text, BarcodeFormat.QR_CODE, 150, 150);
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                MatrixToImageWriter.writeToStream(matrix, "PNG", out);
                return Image.getInstance(out.toByteArray());
        }

        public Certificate getCertificateByUid(String uid) {
                return certificateRepository.findByUid(uid)
                                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        }
}
