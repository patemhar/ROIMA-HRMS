import { useAuth } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { normalCacheConfig, orgKeys } from "./types";
import { orgService } from "@/services/organizationService";

export const useNextLayer = (userId: string) => {
    const isAuthenticated = useAuth(u => u.auth.isAuthenticated);

    return useQuery({
        queryKey: orgKeys.cildrenByUserID(userId),
        queryFn: async () => {
            const response = await orgService.getNextLayer(userId);

            if(!response.success || !response.data)
                throw new Error(response.errors || "Failed to fetch next layer.")

            return response.data;
        },
        enabled: !!userId && isAuthenticated,
        ...normalCacheConfig
    })
}