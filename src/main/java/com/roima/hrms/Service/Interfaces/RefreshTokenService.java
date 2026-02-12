package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.User;

public interface RefreshTokenService {

    void save(String token, User user);

    void validate(String token);

    void revoke(String token, String reason, String newToken);
}
