package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Shared.Dtos.Auth.AuthResponseDto;
import com.roima.hrms.Shared.Dtos.Auth.LoginRequestDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    AuthResponseDto login(LoginRequestDto request,
                          HttpServletResponse response);

    void refreshToken(HttpServletRequest request,
                      HttpServletResponse response);

    void logout(HttpServletRequest request,
                HttpServletResponse response);
}