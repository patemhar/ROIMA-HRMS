package com.roima.hrms.Dtos;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private String errors = null;
    private T data = null;

    public ApiResponse(boolean success, String message, String errors, T data) {
        this.success = success;
        this.message = message;
        this.errors = errors;
        this.data = data;
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, null, data);
    }

    public static <T> ApiResponse<T> error(String message, String errors) {
        return new ApiResponse<>(false, message, errors, null);
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getErrors() { return errors; }
    public T getData() { return data; }
}
