package com.roima.hrms.Exception;

import com.roima.hrms.Shared.Dtos.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception ex) {

        if(ex instanceof TokenExpiredException) {
            return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.UNAUTHORIZED
            );
        }



        return new ResponseEntity<>(
                ApiResponse.error(ex.getMessage(), ex.toString()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
