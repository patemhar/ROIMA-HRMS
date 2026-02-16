package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Dtos.auth.AuthResponseDto;
import com.roima.hrms.Dtos.auth.LoginRequestDto;
import com.roima.hrms.Dtos.auth.RegisterRequestDto;
import com.roima.hrms.Dtos.auth.RegisterResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    RegisterResponseDto register(RegisterRequestDto dto);

    AuthResponseDto login(LoginRequestDto request,
                          HttpServletResponse response);

    AuthResponseDto refreshToken(HttpServletRequest request,
                      HttpServletResponse response);

    void logout(HttpServletRequest request,
                HttpServletResponse response);
}