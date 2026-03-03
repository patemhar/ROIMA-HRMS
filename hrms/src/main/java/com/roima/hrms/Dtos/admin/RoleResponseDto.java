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
public class RoleResponseDto {
    private UUID id;
    private String name;
    private String description;
    private Integer userCount;
    private Integer permissionCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

