package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.dtos.admin.*;
import com.roima.hrms.dtos.game.GameSlotBookingRequestResponse;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface AdminService {

    // Dashboard Stats
    DashboardStatsDto getDashboardStats();
    SystemActivityDto getSystemActivity();

    // Department Management
    Page<DepartmentResponseDto> getAllDepartments(int pageNumber, int pageSize, String search);
    DepartmentResponseDto getDepartmentById(UUID departmentId);
    DepartmentResponseDto createDepartment(DepartmentRequestDto request);
    DepartmentResponseDto updateDepartment(UUID departmentId, DepartmentRequestDto request);
    void deleteDepartment(UUID id);

    // Role Management
    Page<RoleResponseDto> getAllRoles(int pageNumber, int size, String search);
    RoleResponseDto getRoleById(UUID roleId);
    RoleResponseDto createRole(RoleRequestDto request);
    RoleResponseDto updateRole(UUID roleId, RoleRequestDto request);
    void deleteRole(UUID roleId);

    // Job Management
    void toggleJobActiveStatus(UUID jobId);

}
