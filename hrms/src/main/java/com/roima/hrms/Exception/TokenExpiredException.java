package com.roima.hrms.Exception;

public class TokenExpiredException extends IllegalAccessException {
    public TokenExpiredException(String message) {
        super(message);
    }
}