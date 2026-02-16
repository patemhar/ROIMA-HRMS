package com.roima.hrms.Exception;

import com.roima.hrms.Dtos.ApiResponse;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<String>> handleIllegalArgument(IllegalArgumentException ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<String>> handleResourceNotFound(ResourceNotFoundException ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<String>> handleBadRequest(BadRequestException ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(HttpClientErrorException.Unauthorized.class)
    public ResponseEntity<ApiResponse<String>> handleUnauthorizedRequest(HttpClientErrorException.Unauthorized ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.UNAUTHORIZED
        );
    }


    @ExceptionHandler(IllegalAccessException.class)
    public ResponseEntity<ApiResponse<String>> handleUnauthorizedRequest(IllegalAccessException ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<String>> RunTimeException(RuntimeException ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ApiResponse<String>> handleIOException(IllegalAccessException ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleAllExceptions(Exception ex) {
        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

}
