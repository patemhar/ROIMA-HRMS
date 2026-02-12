package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.User;

import java.util.UUID;

public interface RefreshTokenService {

    void save(String token, User user);

    void validate(String token);

    void revoke(UUID userId, String reason, String newToken);

    void revokeAll(UUID userId, String reason, String newRefreshToken);
}
