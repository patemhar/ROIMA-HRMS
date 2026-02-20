package com.roima.hrms.Dtos.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
public class UserDetailResponse {

    private UUID id;

    private String first_name;

    private String last_name;

    private String email;

    private LocalDateTime last_login;

    private Boolean is_active;

    private String role;

    private String reports_to;

    private Set<String> permission = new HashSet<>();
}
