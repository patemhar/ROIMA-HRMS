package com.roima.hrms.Controller;

import com.roima.hrms.Service.Interfaces.userService;
import com.roima.hrms.dtos.ApiResponse;
import com.roima.hrms.dtos.User.UserDetailResponse;
import com.roima.hrms.dtos.admin.*;
import com.roima.hrms.Service.Interfaces.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final userService userService;

    // Dashboard Statistics Endpoints

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<DashboardStatsDto> getDashboardStats() {
        return ApiResponse.success(
            adminService.getDashboardStats(),
            "Dashboard statistics fetched successfully"
        );
    }

    @GetMapping("/dashboard/activity")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<SystemActivityDto> getSystemActivity() {
        return ApiResponse.success(
            adminService.getSystemActivity(),
            "System activity fetched successfully"
        );
    }

    @GetMapping("users/locked")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<List<UserDetailResponse>> getLockedUsers() {
        return ApiResponse.success(
            userService.getLockedUsers(),
            "Locked users fetched successfully"
        );
    }

    // Department Management Endpoints

    @GetMapping("/departments")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<Page<DepartmentResponseDto>> getAllDepartments(
            @RequestParam(required = false, defaultValue = "0") Integer pageNumber,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.success(
            adminService.getAllDepartments(pageNumber - 1, pageSize, search),
            "Departments fetched successfully"
        );
    }

    @GetMapping("/departments/{departmentId}")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<DepartmentResponseDto> getDepartmentById(@PathVariable UUID departmentId) {
        return ApiResponse.success(
            adminService.getDepartmentById(departmentId),
            "Department fetched successfully"
        );
    }

    @PostMapping("/departments")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<DepartmentResponseDto> createDepartment(
            @RequestBody @Valid DepartmentRequestDto request
    ) {
        return ApiResponse.success(
            adminService.createDepartment(request),
            "Department created successfully"
        );
    }

    @PutMapping("/departments/{departmentId}")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<DepartmentResponseDto> updateDepartment(
            @PathVariable UUID departmentId,
            @RequestBody @Valid DepartmentRequestDto request
    ) {
        return ApiResponse.success(
            adminService.updateDepartment(departmentId, request),
            "Department updated successfully"
        );
    }

    @DeleteMapping("/departments/{departmentId}")
    @PreAuthorize("hasAuthority('PER002')") // Admin/HR permission
    public ApiResponse<Void> deleteDepartment(@PathVariable UUID departmentId) {
        adminService.deleteDepartment(departmentId);
        return ApiResponse.success(null, "Department deleted successfully");
    }

    // Role Management Endpoints

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<Page<RoleResponseDto>> getAllRoles(
            @RequestParam(required = false, defaultValue = "0") Integer pageNumber,
            @RequestParam(required = false, defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String searchTerm
    ) {
        return ApiResponse.success(
            adminService.getAllRoles(pageNumber - 1, pageSize, searchTerm),
            "Roles fetched successfully"
        );
    }

    @GetMapping("/roles/{roleId}")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<RoleResponseDto> getRoleById(@PathVariable UUID roleId) {
        return ApiResponse.success(
            adminService.getRoleById(roleId),
            "Role fetched successfully"
        );
    }

    @PostMapping("/roles")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<RoleResponseDto> createRole(
            @RequestBody @Valid RoleRequestDto request
    ) {
        return ApiResponse.success(
            adminService.createRole(request),
            "Role created successfully"
        );
    }

    @PutMapping("/roles/{roleId}")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<RoleResponseDto> updateRole(
            @PathVariable UUID roleId,
            @RequestBody @Valid RoleRequestDto request
    ) {
        return ApiResponse.success(
            adminService.updateRole(roleId, request),
            "Role updated successfully"
        );
    }

    @DeleteMapping("/roles/{roleId}")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<Void> deleteRole(@PathVariable UUID roleId) {
        adminService.deleteRole(roleId);
        return ApiResponse.success(null, "Role deleted successfully");
    }

    @PatchMapping("/jobs/{jobId}/toggle-status")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<Void> toggleJobActiveStatus(@PathVariable UUID jobId) {
        adminService.toggleJobActiveStatus(jobId);
        return ApiResponse.success(null, "Job status toggled successfully");
    }

}
