import { AdminService as adminService } from "@/services/adminService";
import { adminKeys, adminCacheConfig } from "./types";
import { useAuth } from "@/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "@/types/api";

type Schemas = components["schemas"];

// Dashboard Statistics Hooks
export const useGetDashboardStats = () => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.dashboardStats(),
    queryFn: async () => {
      const res = await adminService.getDashboardStats();
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch dashboard stats");
      return res.data;
    },
    enabled: isAuthenticated,
    ...adminCacheConfig,
  });
};

export const useGetSystemActivity = () => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.systemActivity(),
    queryFn: async () => {
      const res = await adminService.getSystemActivity();
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch system activity");
      return res.data;
    },
    enabled: isAuthenticated,
    ...adminCacheConfig,
  });
};

// Department Management Hooks
export const useGetAllDepartments = (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm?: string
) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.departments(pageNumber, pageSize, searchTerm),
    queryFn: async () => {
      const res = await adminService.getAllDepartments(pageNumber, pageSize, searchTerm);
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch departments");
      return res.data;
    },
    enabled: isAuthenticated,
    ...adminCacheConfig,
  });
};

export const useGetDepartmentById = (id: string) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.departmentById(id),
    queryFn: async () => {
      const res = await adminService.getDepartmentById(id);
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch department");
      return res.data;
    },
    enabled: !!id && isAuthenticated,
    ...adminCacheConfig,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Schemas["DepartmentRequestDto"]) => {
      const response = await adminService.createDepartment(data);
      if (!response.success) {
        throw new Error(response.errors || "Failed to create department");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.departments() });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Schemas["DepartmentRequestDto"] }) => {
      const response = await adminService.updateDepartment(id, data);
      if (!response.success) {
        throw new Error(response.errors || "Failed to update department");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.departments() });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminService.deleteDepartment(id);
      if (!response.success) {
        throw new Error(response.errors || "Failed to delete department");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.departments() });
    },
  });
};

// Role Management Hooks
export const useGetAllRoles = (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm?: string
) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.roles(pageNumber, pageSize, searchTerm),
    queryFn: async () => {
      const res = await adminService.getAllRoles(pageNumber, pageSize, searchTerm);
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch roles");
      return res.data;
    },
    enabled: isAuthenticated,
    ...adminCacheConfig,
  });
};

export const useGetRoleById = (id: string) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.roleById(id),
    queryFn: async () => {
      const res = await adminService.getRoleById(id);
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch role");
      return res.data;
    },
    enabled: !!id && isAuthenticated,
    ...adminCacheConfig,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Schemas["RoleRequestDto"]) => {
      const response = await adminService.createRole(data);
      if (!response.success) {
        throw new Error(response.errors || "Failed to create role");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Schemas["RoleRequestDto"] }) => {
      const response = await adminService.updateRole(id, data);
      if (!response.success) {
        throw new Error(response.errors || "Failed to update role");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminService.deleteRole(id);
      if (!response.success) {
        throw new Error(response.errors || "Failed to delete role");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.roles() });
    },
  });
};

// System Config Management Hooks
export const useGetAllSystemConfigs = () => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.systemConfigs,
    queryFn: async () => {
      const res = await adminService.getAllSystemConfigs();
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch system configs");
      return res.data;
    },
    enabled: isAuthenticated,
    ...adminCacheConfig,
  });
};

export const useGetSystemConfigById = (id: string) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: adminKeys.systemConfigById(id),
    queryFn: async () => {
      const res = await adminService.getSystemConfigById(id);
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch system config");
      return res.data;
    },
    enabled: !!id && isAuthenticated,
    ...adminCacheConfig,
  });
};

export const useCreateSystemConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Schemas["SystemConfigRequestDto"]) => {
      const response = await adminService.createSystemConfig(data);
      if (!response.success) {
        throw new Error(response.errors || "Failed to create system config");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.systemConfigs });
    },
  });
};

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Schemas["SystemConfigRequestDto"] }) => {
      const response = await adminService.updateSystemConfig(id, data);
      if (!response.success) {
        throw new Error(response.errors || "Failed to update system config");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.systemConfigs });
    },
  });
};

export const useDeleteSystemConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await adminService.deleteSystemConfig(id);
      if (!response.success) {
        throw new Error(response.errors || "Failed to delete system config");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.systemConfigs });
    },
  });
};
