import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";
import { id } from "zod/v4/locales";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class adminService {

    getDashboardStats(): ApiResult<Schemas["DashboardStatsDto"]> {
        return apiClient.get<Schemas["DashboardStatsDto"]>("/api/admin/dashboard/stats");
    }

    getSystemActivity(): ApiResult<Schemas["SystemActivityDto"]> {
        return apiClient.get<Schemas["SystemActivityDto"]>("/api/admin/dashboard/activity");
    }

    getAllDepartments(
        pageNumber: number = 1,
        pageSize: number = 10,
        searchTerm?: string
    ): ApiResult<Schemas["PageDepartmentResponseDto"]> {

        const params = new URLSearchParams();
        params.append("pageNumber", pageNumber.toString());
        params.append("pageSize", pageSize.toString());
        if (searchTerm) {
            params.append("searchTerm", searchTerm);
        }

        return apiClient.get<Schemas["PageDepartmentResponseDto"]>(
            "/api/admin/departments",
            {params}
        );
    }

    getDepartmentById(departmentId: string): ApiResult<Schemas["DepartmentResponseDto"]> {
        return apiClient.get<Schemas["DepartmentResponseDto"]>(
            `/api/admin/departments/${departmentId}`
        );
    }

    createDepartment(data: Schemas["DepartmentRequestDto"]): ApiResult<Schemas["DepartmentResponseDto"]> {
        return apiClient.post<Schemas["DepartmentResponseDto"]>(
            "/api/admin/departments", 
            data
        );
    }

    updateDepartment(departmentId: string, data: Schemas["DepartmentRequestDto"]): ApiResult<Schemas["DepartmentResponseDto"]> {
        return apiClient.put<Schemas["DepartmentResponseDto"]>(
            `/api/admin/departments/${departmentId}`, 
            data
        );
    }

    deleteDepartment(departmentId: string): ApiResult<void> {
        return apiClient.delete<void>(
            `/api/admin/departments/${departmentId}`
        );
    }

    // Role Management
    getAllRoles(
        pageNumber: number = 1,
        pageSize: number = 10,
        searchTerm?: string
    ): ApiResult<Schemas["PageRoleResponseDto"]> {

        const params = new URLSearchParams();
        params.append("pageNumber", pageNumber.toString());
        params.append("pageSize", pageSize.toString());
        if (searchTerm) {
            params.append("searchTerm", searchTerm);
        }

        return apiClient.get<Schemas["PageRoleResponseDto"]>(
            "/api/admin/roles", 
            {params}
        );
    }

    getRoleById(roleId: string): ApiResult<Schemas["RoleResponseDto"]> {
        return apiClient.get<Schemas["RoleResponseDto"]>(
            `/api/admin/roles/${roleId}`
        );
    }

    createRole(data: Schemas["RoleRequestDto"]): ApiResult<Schemas["RoleResponseDto"]> {
        return apiClient.post<Schemas["RoleResponseDto"]>(
            "/api/admin/roles", 
            data
        );
    }

    updateRole(roleId: string, data: Schemas["RoleRequestDto"]): ApiResult<Schemas["RoleResponseDto"]> {
        return apiClient.put<Schemas["RoleResponseDto"]>(
            `/api/admin/roles/${roleId}`,
            { body: data }
        );
    }

    deleteRole(roleId: string): ApiResult<void> {
        return apiClient.delete<void>(
            `/api/admin/roles/${roleId}`
        );
    }

    toggleJobActiveStatus(jobId: string): ApiResult<void> {
        return apiClient.patch<void>(
            `/api/admin/jobs/${jobId}/toggle-status`
        );
    }

    // System Config Manage
    getAllSystemConfigs(): ApiResult<Schemas["SystemConfigResponseDto"][]> {
        return apiClient.get<Schemas["SystemConfigResponseDto"][]>(
            "/system-config"
        );
    }

    getSystemConfigById(id: string): ApiResult<Schemas["SystemConfigResponseDto"]> {
        return apiClient.get<Schemas["SystemConfigResponseDto"]>(
            `/system-config/${id}`
        );
    }

    createSystemConfig(data: Schemas["SystemConfigRequestDto"]): ApiResult<Schemas["SystemConfigResponseDto"]> {
        return apiClient.post<Schemas["SystemConfigResponseDto"]>(
            "/system-config", 
            data
        );
    }

    updateSystemConfig(id: string, data: Schemas["SystemConfigRequestDto"]): ApiResult<Schemas["SystemConfigResponseDto"]> {
        return apiClient.put<Schemas["SystemConfigResponseDto"]>(
            `/system-config/${id}`,
            data
        );
    }

    deleteSystemConfig(id: string): ApiResult<void> {
        return apiClient.delete<void>(
            `/system-config/${id}`
        );
    }

}

export const AdminService = new adminService();