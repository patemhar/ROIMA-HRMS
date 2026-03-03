package com.roima.hrms.dtos.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String roleName;
    private String departmentName;
    private String empNumber;
    private boolean active;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private UUID reportsToId;
    private String reportsToName;
}

