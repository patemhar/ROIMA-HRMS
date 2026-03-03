package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.RefreshToken;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Exception.AuthenticationFailedException;
import com.roima.hrms.Exception.RoleNotFoundException;
import com.roima.hrms.Exception.UserNotFoundException;
import com.roima.hrms.Repositories.RefreshTokenRepository;
import com.roima.hrms.Repositories.RoleRepository;
import com.roima.hrms.Repositories.SystemConfigRepository;
import com.roima.hrms.Repositories.UserRepository;
import com.roima.hrms.Mapper.AuthMapper;
import com.roima.hrms.Service.Interfaces.AuthService;
import com.roima.hrms.dtos.auth.AuthResponseDto;
import com.roima.hrms.dtos.auth.LoginRequestDto;
import com.roima.hrms.dtos.auth.RegisterRequestDto;
import com.roima.hrms.dtos.auth.RegisterResponseDto;
import com.roima.hrms.Utility.JwtUtil;
import com.roima.hrms.Utility.SecurityUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
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
    private final SystemConfigRepository systemConfigRepository;

    @Value("${failed.login.attempts.limit:5}")
    private int maxFailedAttempts;

    @Value("${account.lock.duration:30}")
    private int lockoutDurationMinutes;

    private void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new RuntimeException("Password cannot be empty");
        }

        if (password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long");
        }

        boolean hasUpperCase = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLowerCase = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecialChar = password.chars().anyMatch(ch -> "!@#$%^&*(),.?\":{}|<>".indexOf(ch) >= 0);

        if (!hasUpperCase || !hasLowerCase || !hasDigit || !hasSpecialChar) {
            throw new RuntimeException("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        }
    }

    @Override
    public RegisterResponseDto register(RegisterRequestDto dto) {

        if( userRepository.existsByEmail(dto.getEmail()) ) {
            throw new RuntimeException("Email already in use.");
        }

        if(!Objects.equals(dto.getPassword(), dto.getConfirm_password())) {
            throw new RuntimeException("Provided password doesn't match");
        }

        validatePassword(dto.getPassword());

        User user = authMapper.ToEntity(dto);

        user.setPassword_hash(passwordEncoder.encode(dto.getPassword()));

        // role
        var existingRole = roleRepository.findById(dto.getRole()).orElseThrow(() -> new RoleNotFoundException("No role found for given role id"));

        user.setRole(existingRole);

        if(dto.getReports_to() != null) {
            var existingUser = userRepository.findById(dto.getReports_to()).orElseThrow(() -> new UserNotFoundException("User not found for reporting"));

            user.setReports_to(existingUser);
        }

        var savedUser = userRepository.save(user);

        log.info("New user registered: {} with role {} by {}", savedUser.getEmail(), savedUser.getRole().getName(), securityUtil.getCurrentUser().getEmail());

        return authMapper.toRegRes(savedUser);
    }

    @Override
    public AuthResponseDto login(LoginRequestDto request, HttpServletResponse response) {

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow(() -> new UserNotFoundException("Invalid Username or Password"));

        if (user.getAccount_locked_until() != null && user.getAccount_locked_until().isAfter(LocalDateTime.now())) {
            throw new AuthenticationFailedException("Account is locked due to too many failed login attempts. Try again later.");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getId(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {

            var maxLoginAttempts = systemConfigRepository.findByKeyName("MAX_LOGIN_ATTEMPTS")
                    .map(config -> Integer.parseInt(config.getValue()))
                    .orElse(maxFailedAttempts);

            var lockDuration = systemConfigRepository.findByKeyName("ACCOUNT_LOCK_DURATION_MINUTES")
                    .map(config -> Integer.parseInt(config.getValue()))
                    .orElse(lockoutDurationMinutes);

            user.setFailed_login_attempts(user.getFailed_login_attempts() + 1);

            if (user.getFailed_login_attempts() >= maxLoginAttempts) {
                user.setAccount_locked_until(LocalDateTime.now().plusMinutes(lockDuration));
                log.warn("User account locked due to too many failed login attempts: {}", user.getEmail());
            }

            userRepository.save(user);
            throw new AuthenticationFailedException("Invalid credentials. You have " + (maxLoginAttempts - user.getFailed_login_attempts()) + " attempts left before your account gets locked.");
        }

        user.setFailed_login_attempts(0);
        user.setAccount_locked_until(null);

        CustomUserDetails userDetails =
                (CustomUserDetails) customUserDetailsService.loadUserByUsername(user.getId().toString());


        String accessToken = jwtUtil.generateAccessToken(userDetails);

        String refreshToken = jwtUtil.generateRefreshToken(userDetails);

        refreshTokenService.revokeAll(user.getId(), "New login", refreshToken);

        saveRefreshToken(user, refreshToken);

        clearCookie(response, "refresh_token");

        addRefreshCookie(response, refreshToken);

        user.setLast_login(LocalDateTime.now());

        userRepository.save(user);

        return authMapper.toAuthRes(user, accessToken);
    }

    @Override
    @Transactional
    public AuthResponseDto refreshToken(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = extractCookie(request, "refresh_token");

        if (refreshToken == null) {
            log.warn("Token refresh failed - No token provided");
            throw new RuntimeException("Refresh token not found");
        }

        RefreshToken token = refreshTokenRepository
                .findByTokenHash(refreshToken)
                .orElseThrow(() -> {
                    log.warn("Token refresh failed - Invalid token");
                    return new RuntimeException("Invalid refresh token");
                });

        if (token.getRevoked_at() != null) {
            log.warn("Token refresh failed - Revoked token used: {}", token.getUserMail());
            throw new RuntimeException("Refresh token has been revoked");
        }

        if (!Objects.equals(jwtUtil.extractUsername(refreshToken), token.getUser().getId().toString()) || token.getExpires_at().isBefore(LocalDateTime.now())) {
            log.warn("Token refresh failed - Expired token: {}", token.getUserMail());
            throw new RuntimeException("Invalid or Expired Refresh Token");
        }

        User user = token.getUser();

        CustomUserDetails userDetails = new CustomUserDetails(user);

        String newAccessToken = jwtUtil.generateAccessToken(userDetails);
        String newRefreshToken = jwtUtil.generateRefreshToken(userDetails);

        refreshTokenService.revoke(user.getId(), "Token rotated", newRefreshToken);

        saveRefreshToken(user, newRefreshToken);

        clearCookie(response, "refresh_token");
        addRefreshCookie(response, newRefreshToken);

        log.info("Token refreshed: {}", user.getEmail());

        return authMapper.toAuthRes(user, newAccessToken);

    }

    @Override
    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {

        String refreshToken = extractCookie(request, "refresh_token");

        if (refreshToken == null) {
            clearCookie(response, "refresh_token");
            return;
        }

        var userId = jwtUtil.extractUsername(refreshToken);

        refreshTokenService.revoke(UUID.fromString(userId), "User logout", null);

        clearCookie(response, "refresh_token");

        log.info("User logged out: {}", userId);

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
        cookie.setPath("/");
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
