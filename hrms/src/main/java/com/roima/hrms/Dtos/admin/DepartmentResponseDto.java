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
public class DepartmentResponseDto {
    private UUID id;
    private String departmentName;
    private String departmentCode;
    private Integer employeeCount;
    private Integer jobOpeningsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

