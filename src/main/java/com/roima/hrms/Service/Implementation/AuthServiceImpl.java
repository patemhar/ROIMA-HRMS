package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Referral;
import com.roima.hrms.Core.Entities.RefreshToken;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Infrastructure.Repositories.RefreshTokenRepository;
import com.roima.hrms.Infrastructure.Repositories.UserRepository;
import com.roima.hrms.Service.Interfaces.AuthService;
import com.roima.hrms.Shared.Dtos.Auth.AuthResponseDto;
import com.roima.hrms.Shared.Dtos.Auth.LoginRequestDto;
import com.roima.hrms.Utility.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Override
    public AuthResponseDto login(LoginRequestDto request, HttpServletResponse response) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                        )
        );

        CustomUserDetails userDetails =
                (CustomUserDetails) userDetailsService.loadUserByUsername(request.getEmail());

        User user = userDetails.getUser();

        String accessToken = jwtUtil.generateAccessToken(userDetails);

//        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

//        saveRefreshToken(user, refreshToken);

        addAccessCookie(response, accessToken);
//        addRefreshCookie(response, refreshToken);

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

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);

        addAccessCookie(response, newAccessToken);
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = extractCookie(request, "refresh_token");

        refreshTokenRepository
                .findByTokenHash(refreshToken)
                .isPresent();

        clearCookie(response, "access_token");
        clearCookie(response, "refresh_token");
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setTokenHash(token);
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

