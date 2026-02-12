package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Shared.Dtos.Auth.AuthResponseDto;
import com.roima.hrms.Shared.Dtos.Auth.LoginRequestDto;
import com.roima.hrms.Shared.Dtos.Auth.RegisterRequestDto;
import com.roima.hrms.Shared.Dtos.Auth.RegisterResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    RegisterResponseDto register(RegisterRequestDto dto);

    AuthResponseDto login(LoginRequestDto request,
                          HttpServletResponse response);

    void refreshToken(HttpServletRequest request,
                      HttpServletResponse response);

    void logout(HttpServletRequest request,
                HttpServletResponse response);
}