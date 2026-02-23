import type { components } from "@/types/api";
import { jobKeys, normalCacheConfig } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { JobService } from "@/services/jobService";
import { useAuth } from "@/store";

type Schemas = components["schemas"];

// get all active jobs
export const useGetAllActiveJobs = () => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: jobKeys.all,
    queryFn: async () => {
      const res = await JobService.getAllActiveJobs();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig,
  });
};

// create job
export const useCreateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: Schemas["JobRequestDto"]
        ) => {
            const response = await JobService.creatJob(
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to create job")
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.all })
        }
    })
}

// share a job
export const useShareJob = () => {
    return useMutation({
        mutationFn: async (
            data: Schemas["ShareJobRequest"]
        ) => {

            const response = await JobService.shareJob(
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to share job")
            }

            return response;
        }
    })
}

// delete job
export const useDeleteJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            id: string
        ) => {
            const response = await JobService.deleteJob(
                id
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to create travel")
            }

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.all})
        }
    })
}

// refer friend
export const useRefferFriend = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: any
        ) => {

            const response = await JobService.referFriend(
                data
            );

            if(!response.success) {
                throw new Error(response.errors || "Failed to refer friend")
            }

            return response;
        }
    })
}

// get job sharing records
export const useGetJobSharingRecords = () => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: [...jobKeys.all, "sharing-records"],
    queryFn: async () => {
      const res = await JobService.getJobSharingRecords();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig,
  });
};

// get referrals
export const useGetReferrals = () => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: [...jobKeys.all, "referrals"],
    queryFn: async () => {
      const res = await JobService.getReferrals();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig,
  });
};
