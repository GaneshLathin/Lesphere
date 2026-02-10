package com.example.skillforge.controller;

import com.example.skillforge.dto.request.ChatRequest;
import com.example.skillforge.dto.response.ChatResponse;
import com.example.skillforge.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName(); // JWT usually sets name to email/username

        ChatResponse response = chatService.processChat(email, request);
        return ResponseEntity.ok(response);
    }
}
