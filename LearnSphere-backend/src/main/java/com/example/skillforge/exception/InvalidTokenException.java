package com.example.skillforge.exception;

/**
 * Exception thrown when JWT token is invalid
 */
public class InvalidTokenException extends RuntimeException {
    public InvalidTokenException(String message) {
        super(message);
    }
}
