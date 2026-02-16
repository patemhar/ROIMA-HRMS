package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Referral;
import com.roima.hrms.Core.Entities.RefreshToken;
import com.roima.hrms.Core.Entities.Role;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Exception.RoleNotFoundException;
import com.roima.hrms.Exception.UserNotFoundException;
import com.roima.hrms.Infrastructure.Repositories.RefreshTokenRepository;
import com.roima.hrms.Infrastructure.Repositories.RoleRepository;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.InvalidKeyException;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.logging.Logger;

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
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    public RegisterResponseDto register(RegisterRequestDto dto) {

        if( userRepository.existsByEmail(dto.getEmail()) ) {
            throw new RuntimeException("Email already in use.");
        }

        if(!Objects.equals(dto.getPassword(), dto.getConfirm_password())) {
            throw new RuntimeException("Provided password doesn't match");
        }

        // password
        User user = authMapper.ToEntity(dto);

        user.setPassword_hash(passwordEncoder.encode(dto.getPassword()));

        // role
        var existingRole = roleRepository.findById(dto.getRole()).orElseThrow(() -> new RoleNotFoundException("No role found for given role id"));

        user.setRole(existingRole);

        if(dto.getReports_to() != null) {
            //reports to
            var existingUser = userRepository.findById(dto.getReports_to()).orElseThrow(() -> new UserNotFoundException("User not found for reporting"));

            user.setReports_to(existingUser);

        }

        var savedUser = userRepository.save(user);

        return authMapper.toRegRes(savedUser);
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request, HttpServletResponse response) {

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new UserNotFoundException("user not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getId(),
                        request.getPassword()
                        )
        );

        CustomUserDetails userDetails =
                (CustomUserDetails) customUserDetailsService.loadUserByUsername(user.getId().toString());


        String accessToken = jwtUtil.generateAccessToken(userDetails);

        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        refreshTokenService.revokeAll(user.getId(), "New login", refreshToken);

        saveRefreshToken(user, refreshToken);

        clearCookie(response, "refreshToken");

        addRefreshCookie(response, refreshToken);

        user.setLast_login(LocalDateTime.now());

        return new AuthResponseDto(
                user.getId(),
                user.getFirst_name() + user.getLast_name(),
                user.getEmail(),
                user.getRole().getName(),
                accessToken
        );
    }

    @Override
    public AuthResponseDto refreshToken(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = extractCookie(request, "refresh_token");

        RefreshToken token = refreshTokenRepository
                .findByTokenHash(refreshToken)
                .orElseThrow(() ->
                        new RuntimeException("Invalid refresh token"));

        if (!Objects.equals(jwtUtil.extractUsername(refreshToken), token.getUser().getId().toString()) || token.getExpires_at().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or Expired Refresh Token");
        }

        User user = token.getUser();

        CustomUserDetails userDetails = new CustomUserDetails(user);

        clearCookie(response, "refresh_token");

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

        refreshTokenService.revoke(user.getId(), "Token rotated", newRefreshToken);

        saveRefreshToken(user, newRefreshToken);

        addRefreshCookie(response, newRefreshToken);

        return new AuthResponseDto(
                user.getId(),
                user.getFirst_name() + user.getLast_name(),
                user.getEmail(),
                user.getRole().getName(),
                newAccessToken
        );

    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = extractCookie(request, "refresh_token");

        var userId = jwtUtil.extractUsername(refreshToken);

        refreshTokenService.revoke(UUID.fromString(userId), "User logout", null);

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

