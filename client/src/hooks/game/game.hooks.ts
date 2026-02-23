import { useAuth } from "@/store";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { gameKeys, normalCacheConfig } from "./types";
import { GameService } from "@/services/gameService";
import type { components } from "@/types/api";

type Schemas = components["schemas"];


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

export const useGetGameSlots = ({
  gameId,
  date
} : {
  gameId: string,
  date: string
}) => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: gameKeys.slotsByGame(gameId, date),
    queryFn: async () => {
      const res = await GameService.getGameSlots({ gameId, date });

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch game slots");

      return res.data;
    },
    enabled: isAuthenticated && !!gameId && !!date,
    ...normalCacheConfig,
  })
}

export const useGetGame = (
  gameId: string
) => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: gameKeys.gameById(gameId),
    queryFn: async () => {
      console.log(gameId);
      const res = await GameService.getGameById(gameId);

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch game");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig,
  })
}

export const useGetGameCycle = (
  gameId: string
) => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey:gameKeys.cycleByGameId(gameId),
    queryFn: async () => {

      const res = await GameService.getGamecycle(gameId);

      if (!res.success) 
        throw new Error(res.errors || "Failed to fetch cycle");

      return res;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig
  })
}

export const useGetUserGameStats = () => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: ["gameStats"],
    queryFn: async () => {
      const res = await GameService.getUserGameStats();

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch game stats");

      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig,
  });
};

export const useGetUserActiveBooking = (gameId: string) => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: ["activeBooking", gameId],
    queryFn: async () => {
      const res = await GameService.getUserActiveBooking(gameId);

      if (!res.success) {
        // No active booking is not an error
        return null;
      }

      return res.data || null;
    },
    enabled: isAuthenticated && !!gameId,
    ...normalCacheConfig,
  });
};

export const useMakeBookingRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Schemas["GameSlotBookingRequestDto"]) => {
      const result = await GameService.makeBookingRequest(data);
      
      if (!result.success)
        throw new Error(result.errors || "Failed to make booking request");

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeBooking"] });
      queryClient.invalidateQueries({ queryKey: ["game", "slots"] });
      queryClient.invalidateQueries({ queryKey: ["gameStats"] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => GameService.cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeBooking"] });
      queryClient.invalidateQueries({ queryKey: ["game", "slots"] });
      queryClient.invalidateQueries({ queryKey: ["gameStats"] });
    },
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Schemas["GameCreateRequestDto"]) =>
      GameService.createGame(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Schemas["GameCreateRequestDto"] }) =>
      GameService.updateGame({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
};