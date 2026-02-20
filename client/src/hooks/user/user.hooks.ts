import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userProfileService } from "@/services/userProfileService";
import { userKeys } from "./types";
import { useAuth } from "@/store";
import type { components } from "@/types/api";
import { authService } from "@/services/authService";
import { normalCacheConfig } from "../travel/types";

type Schemas = components["schemas"];

export const useMyProfile = () => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: userKeys.myProfile(),
    queryFn: async () => {
      const res = await userProfileService.getMyProfile();
      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch profile");

      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
};

export const useUserProfile = (userId: string) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: userKeys.userProfile(userId),
    queryFn: async () => {
      const res = await userProfileService.getProfile(userId);
      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch user profile");

      return res.data;
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 60 * 1000,
  });
};

export const useAllUsers = () => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: userKeys.all,
    queryFn: async () => {
      const res = await userProfileService.getAllUsers();
      if(!res.success || !res.data) {
        throw new Error(res.errors || "Failed to fetch users.")
      }
      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig
  })
  
}

export const useAccountDetails = () => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);
    const userId = useAuth((state) => state.auth.user?.id);

  return useQuery({
    queryKey: userKeys.accountDetails(userId ?? "anonymous"),
    queryFn: async () => {
      const res = await authService.getProfile();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch user Accoubt details");

      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export const useCreateProfile = () => {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: Schemas["ProfileAdminRequestDTO"]
        ) => {
            const result = await userProfileService.createProfile(data);

            if(!result.success) {
                throw new Error(result.errors || "Failed to create profile.")
            }

            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: userKeys.all,
            });
        },
    })
}


export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Schemas["ProfileAdminRequestDTO"]
    ) => {
      const result = await userProfileService.updateProfile(data);
      
      if (!result.success)
        throw new Error(result.errors || "Failed to update profile");

      return result;
    },
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.userProfile(data.userId ?? "anonymous"),
      });
    },
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const userId = useAuth((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: async (
      data: Schemas["ProfileSelfUpdateDTO"]
    ) => {
      const result = await userProfileService.updateMyProfile(data);
      
      if (!result.success)
        throw new Error(result.errors || "Failed to update profile");

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.userProfile(userId ?? "anonymous"),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.myProfile() });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const result = await userProfileService.uploadAvatar(file);
      
      if (!result.success)
        throw new Error(result.errors || "failed to upload avatar");

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.myProfile(),
      });
    },
  });
};

export const useAddInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const result = await userProfileService.addInterest(gameId);
      
      if (!result.success)
        throw new Error(result.errors || "Failed to add interest");

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.myProfile(),
      });
    },
  });
};

export const useRemoveInterest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const result = await userProfileService.removeInterest(gameId);
      
      if (!result.success)
        throw new Error(result.errors || "Failed to remove interest");

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.myProfile(),
      });
    },
  });
};

export const useUpdateMyUser = () => {
  const queryClient = useQueryClient();
  const userId = useAuth((state) => state.auth.user?.id);

  return useMutation({
    mutationFn: async (
      data: Schemas["UserSelfUpdateDTO"]
    ) => {
      const result = await authService.updateMyUser(data);
      
      if (!result.success)
        throw new Error(result.errors || "Failed to update account");

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.accountDetails(userId ?? "anonymous"),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.myProfile() });
    },
  });
};

export const useUpdateUserByHR = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data
    }: {
      userId: string;
      data: Schemas["UserAdminUpdateDTO"];
    }) => {
      const result = await authService.updateUserByHR(userId, data);
      
      if (!result.success)
        throw new Error(result.errors || "Failed to update user");

      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: userKeys.accountDetails(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.userProfile(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
