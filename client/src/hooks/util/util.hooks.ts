import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store";
import type { components } from "@/types/api";
import { normalCacheConfig } from "../travel/types";
import { utilService } from "@/services/utilService";
import { utilKeys } from "./types";

type Schemas = components["schemas"];

export const useGetAllUsers = () => {
  const isAuthenticated = useAuth((s) => s.auth.isAuthenticated);

  return useQuery({
    queryKey: utilKeys.users(),
    queryFn: async () => {
      const res = await utilService.getAllUsers();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch users");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig
  });
};

export const useGetAllDepartments = () => {
  const isAuthenticated = useAuth((s) => s.auth.isAuthenticated);

   return useQuery({
    queryKey: utilKeys.departments(),
    queryFn: async () => {
      const res = await utilService.getAllDepartments();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch departments");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig
  });
};

export const useGetAllRoles = () => {
  const isAuthenticated = useAuth((s) => s.auth.isAuthenticated);

  return useQuery({
    queryKey: utilKeys.roles(),
    queryFn: async () => {
      const res = await utilService.getAllRoles();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch roles");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig
  });
};

export const useGetAllTravelMembers = (id: string) => {
  const isAuthenticated = useAuth((s) => s.auth.isAuthenticated);

   return useQuery({
    queryKey: utilKeys.usersByTravelId(id),
    queryFn: async () => {
      const res = await utilService.getAllTravelMembers(id);

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch users from a travel");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig
  });
};

export const useGetAllGames = () => {
  const isAuthenticated = useAuth((s) => s.auth.isAuthenticated);

  return useQuery({
    queryKey: utilKeys.games(),
    queryFn: async () => {
      const res = await utilService.getAllGames();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch games");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig
  });
};
