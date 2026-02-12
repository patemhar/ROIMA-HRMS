package com.roima.hrms.Shared.Dtos.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
public class UserDetailResponse {

    private UUID id;

    private String name;

    private String email;

    private LocalDateTime last_login;

    private boolean is_active;

    private String role;

    private UUID reports_to;
}
