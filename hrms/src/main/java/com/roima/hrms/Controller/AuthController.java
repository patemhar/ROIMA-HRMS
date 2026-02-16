package com.roima.hrms.Controller;

import com.roima.hrms.Service.Interfaces.AuthService;
import com.roima.hrms.Shared.Dtos.ApiResponse;
import com.roima.hrms.Shared.Dtos.Auth.AuthResponseDto;
import com.roima.hrms.Shared.Dtos.Auth.LoginRequestDto;
import com.roima.hrms.Shared.Dtos.Auth.RegisterRequestDto;
import com.roima.hrms.Shared.Dtos.Auth.RegisterResponseDto;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@OpenAPIDefinition(
        info = @Info(
                title = "HRMS API",
                version = "1.0",
                description = "API documentation for HRMS"
        )
)
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponseDto> login(
            @RequestBody LoginRequestDto request,
            HttpServletResponse response) {

        AuthResponseDto authResponse =
                authService.login(request, response);

        return ApiResponse.success(authResponse, "User Logged in Successfully");
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponseDto> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {

        var authResponse = authService.refreshToken(request, response);

        return ApiResponse.success(authResponse, "Access token refreshed");
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        authService.logout(request, response);

        return ApiResponse.success(null, "Logged out successfully");
    }

    @PostMapping("/register")
    public ApiResponse<RegisterResponseDto> register (
        @RequestBody RegisterRequestDto dto
    ) {

        RegisterResponseDto result = authService.register(dto);

        return ApiResponse.success(result, "user registered successfully");
    }
}