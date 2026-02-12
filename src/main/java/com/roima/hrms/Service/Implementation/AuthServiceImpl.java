package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Referral;
import com.roima.hrms.Core.Entities.RefreshToken;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Infrastructure.Repositories.RefreshTokenRepository;
import com.roima.hrms.Infrastructure.Repositories.UserRepository;
import com.roima.hrms.Mapper.AuthMapper;
import com.roima.hrms.Service.Interfaces.AuthService;
import com.roima.hrms.Shared.Dtos.Auth.AuthResponseDto;
import com.roima.hrms.Shared.Dtos.Auth.LoginRequestDto;
import com.roima.hrms.Shared.Dtos.Auth.RegisterRequestDto;
import com.roima.hrms.Shared.Dtos.Auth.RegisterResponseDto;
import com.roima.hrms.Utility.JwtUtil;
import com.roima.hrms.Utility.SecurityUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final RefreshTokenServiceImpl refreshTokenService;
    private final AuthMapper authMapper;
    private final SecurityUtil securityUtil;

//    public AuthServiceImpl(
//        AuthenticationManager authenticationManager,
//        CustomUserDetailsService customUserDetailsService,
//        JwtUtil jwtUtil,
//        RefreshTokenRepository refreshTokenRepository,
//        UserRepository userRepository,
//        RefreshTokenServiceImpl refreshTokenService
//    ) {
//        this.authenticationManager = authenticationManager;
//        this.customUserDetailsService = customUserDetailsService;
//        this.jwtUtil = jwtUtil;
//        this.refreshTokenRepository = refreshTokenRepository;
//        this.userRepository = userRepository;
//        this.refreshTokenService = refreshTokenService;
//    }

    @Override
    public RegisterResponseDto register(RegisterRequestDto dto) {

        if( userRepository.existsByEmail(dto.getEmail()) ) {
            throw new RuntimeException("Email already in use.");
        }

        if(!Objects.equals(dto.getPassword(), dto.getConfirm_password())) {
            throw new RuntimeException("Provided password doesn't match");
        }

        User user = authMapper.RegReqToEntity(dto);

        var savedUser = userRepository.save(user);

        return authMapper.toRegRes(savedUser);
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request, HttpServletResponse response) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                        )
        );

        CustomUserDetails userDetails =
                (CustomUserDetails) customUserDetailsService.loadUserByUsername(request.getEmail());

        User user = securityUtil.getCurrentUser();

        String accessToken = jwtUtil.generateAccessToken(userDetails);

        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        saveRefreshToken(user, refreshToken);

        clearCookie(response, "access_token");
        clearCookie(response, "refresh_token");

        addAccessCookie(response, accessToken);
        addRefreshCookie(response, refreshToken);

        return new AuthResponseDto(
                user.getId(),
                user.getFirst_name() + user.getLast_name(),
                user.getEmail(),
                user.getRole().getName()
        );
    }

    @Override
    public void refreshToken(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = extractCookie(request, "refresh_token");

        RefreshToken token = refreshTokenRepository
                .findByTokenHash(refreshToken)
                .orElseThrow(() ->
                        new RuntimeException("Invalid refresh token"));

        if(token.getExpires_at().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Refresh token expired");

        User user = token.getUser();

        CustomUserDetails userDetails = new CustomUserDetails(user);

        clearCookie(response, "access_token");
        clearCookie(response, "refresh_token");

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

        refreshTokenService.revoke(refreshToken, "Token rotated", newRefreshToken);

        saveRefreshToken(user, newRefreshToken);

        addAccessCookie(response, newAccessToken);
        addRefreshCookie(response, newRefreshToken);
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = extractCookie(request, "refresh_token");

        refreshTokenService.revoke(refreshToken, "User logout", null);

        clearCookie(response, "access_token");
        clearCookie(response, "refresh_token");
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setTokenHash(token);
        refreshToken.setUserMail(user.getEmail());
        refreshToken.setExpires_at(
                LocalDateTime.now().plusDays(7)
        );

        refreshTokenRepository.save(refreshToken);
    }

    private void addAccessCookie(HttpServletResponse response, String token) {

        Cookie cookie = new Cookie("access_token", token);

        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(15 * 60);

        response.addCookie(cookie);
    }

    private void addRefreshCookie(HttpServletResponse response, String token) {

        Cookie cookie = new Cookie("refresh_token", token);

        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/auth/refresh");
        cookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(cookie);
    }

    private String extractCookie(HttpServletRequest request, String name) {

        if(request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if(name.equals(cookie.getName()))
                return cookie.getValue();
        }

        return null;
    }

    private void clearCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
    }
}

