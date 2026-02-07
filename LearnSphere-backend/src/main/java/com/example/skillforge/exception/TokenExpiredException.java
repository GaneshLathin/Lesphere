package com.example.skillforge.exception;

/**
 * Exception thrown when JWT token has expired
 */
public class TokenExpiredException extends RuntimeException {
    public TokenExpiredException(String message) {
        super(message);
    }
}
