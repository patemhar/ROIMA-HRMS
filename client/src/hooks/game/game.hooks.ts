import { useAuth } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { gameKeys, normalCacheConfig } from "./types";
import { GameService } from "@/services/gameService";


export const useGetAllGames = () => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: gameKeys.all,
    queryFn: async () => {
      const res = await GameService.getAllGames();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch games");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig,
  });
};
