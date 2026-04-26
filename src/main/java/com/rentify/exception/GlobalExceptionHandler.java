package com.rentify.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        response.put("error", "Validation failed");
        response.put("message", "Please check the input fields");
        response.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBadCredentialsException(BadCredentialsException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid email or password");
        error.put("message", "The email or password you entered is incorrect");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
    
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, String>> handleDisabledException(DisabledException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Account disabled");
        error.put("message", "Your account has been disabled. Please contact support.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<Map<String, String>> handleLockedException(LockedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Account locked");
        error.put("message", "Your account has been locked. Please contact support.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        // #region agent log
        try {
            java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
            fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"G\",\"location\":\"GlobalExceptionHandler.handleRuntimeException:27\",\"message\":\"RuntimeException caught\",\"data\":{\"exceptionType\":\"" + ex.getClass().getSimpleName() + "\",\"message\":\"" + (ex.getMessage() != null ? ex.getMessage().replace("\"", "'").replace("\n", " ") : "null") + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
            fw.close();
        } catch (Exception e) {}
        // #endregion
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        error.put("error", message != null ? message : "An error occurred");
        error.put("message", message != null ? message : "An error occurred");
        
        // Determine appropriate status code based on error message
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (message != null) {
            if (message.contains("already exists") || message.contains("Email already")) {
                status = HttpStatus.CONFLICT;
            } else if (message.contains("not found") || message.contains("User not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("Invalid") || message.contains("Unauthorized")) {
                status = HttpStatus.UNAUTHORIZED;
            }
        }
        
        return ResponseEntity.status(status).body(error);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        // #region agent log
        try {
            java.io.FileWriter fw = new java.io.FileWriter("/home/aminu-iliyasu/Desktop/rent_app/.cursor/debug.log", true);
            fw.write("{\"runId\":\"run1\",\"hypothesisId\":\"G\",\"location\":\"GlobalExceptionHandler.handleGenericException:35\",\"message\":\"Generic Exception caught\",\"data\":{\"exceptionType\":\"" + ex.getClass().getSimpleName() + "\",\"message\":\"" + (ex.getMessage() != null ? ex.getMessage().replace("\"", "'").replace("\n", " ") : "null") + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n");
            fw.close();
        } catch (Exception e) {}
        // #endregion
        Map<String, String> error = new HashMap<>();
        error.put("error", "An unexpected error occurred");
        error.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
