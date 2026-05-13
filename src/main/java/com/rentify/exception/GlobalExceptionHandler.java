package com.rentify.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, String>> handleBusinessException(BusinessException ex) {
        log.debug("Business rule: {}", ex.getMessage());
        return buildBody(ex.getStatus(), ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "Access denied";
        return buildBody(HttpStatus.FORBIDDEN, msg);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = error instanceof FieldError fe
                    ? fe.getField()
                    : error.getObjectName();
            errors.put(fieldName, error.getDefaultMessage());
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
        String message = ex.getMessage();
        log.warn("Unhandled runtime exception ({}): {}", ex.getClass().getSimpleName(), message);

        HttpStatus status = mapMessageToStatus(message);

        Map<String, String> body = new HashMap<>();
        String clientMessage = message != null ? message : "An error occurred";
        body.put("error", clientMessage);
        body.put("message", clientMessage);

        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        log.error("Unexpected exception", ex);
        Map<String, String> error = new HashMap<>();
        error.put("error", "An unexpected error occurred");
        error.put("message", ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    private static ResponseEntity<Map<String, String>> buildBody(HttpStatus status, String message) {
        Map<String, String> body = new HashMap<>();
        body.put("error", message);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

    /**
     * Legacy services still throw generic {@link RuntimeException} with English messages.
     */
    private static HttpStatus mapMessageToStatus(String message) {
        if (message == null) {
            return HttpStatus.BAD_REQUEST;
        }
        String m = message.toLowerCase();
        if (m.contains("not found") || m.contains("user not found")) {
            return HttpStatus.NOT_FOUND;
        }
        if (m.contains("don't have permission")
                || m.contains("do not have permission")
                || m.contains("permission")
                || m.contains("only the ")
                || m.contains("only ")
                || m.contains("cannot ")
                || m.contains("you cannot")) {
            return HttpStatus.FORBIDDEN;
        }
        if (m.contains("already exists")
                || m.contains("email already")
                || m.contains("already submitted")
                || m.contains("already reviewed")) {
            return HttpStatus.CONFLICT;
        }
        if (m.contains("invalid") && m.contains("token")) {
            return HttpStatus.UNAUTHORIZED;
        }
        if (m.contains("not authenticated") || m.contains("unauthorized") || m.contains("authentication")) {
            return HttpStatus.UNAUTHORIZED;
        }
        return HttpStatus.BAD_REQUEST;
    }
}
