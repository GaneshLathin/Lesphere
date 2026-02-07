package com.example.skillforge.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3StorageService {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    public String uploadFile(MultipartFile file, String folder) throws IOException {

        String fileName = folder + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
    }

    public void deleteFile(String url) {
        if (url == null) return;

        String key = url.substring(url.indexOf(".com/") + 5);

        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(request);
    }

    public String uploadProfileImage(MultipartFile file, Long userId) throws IOException {
        String fileName = "profile-images/" + userId + "/profile.jpg";

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
    }

    public String uploadBannerImage(MultipartFile file, Long userId) throws IOException {
        String fileName = "banners/" + userId + "/banner-" + System.currentTimeMillis() + ".jpg";

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromBytes(file.getBytes()));

        return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
    }
}

