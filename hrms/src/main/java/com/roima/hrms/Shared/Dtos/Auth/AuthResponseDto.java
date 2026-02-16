package com.roima.hrms.Shared.Dtos.Auth;

import com.roima.hrms.Core.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {

    private UUID userId;

    private String userName;

    private String email;

    private String role;

    private String accessToken;
}
