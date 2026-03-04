import { useAuth } from "@/store";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { gameKeys, normalCacheConfig, smallCacheConfig } from "./types";
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

export const useGetAllGameBookingRequests = (
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm?: string
) => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: gameKeys.bookings(pageNumber, pageSize, searchTerm),
    queryFn: async () => {
      const res = await GameService.getAllGameBookingRequests(pageNumber, pageSize, searchTerm);

      if (!res.success || !res.data)
        throw new Error(res.errors || "Failed to fetch bookings");

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
    ...smallCacheConfig,
  })
}

export const useGetGame = (
  gameId: string
) => {
  const isAuthenticated = useAuth().auth.isAuthenticated;

  return useQuery({
    queryKey: gameKeys.gameById(gameId),
    queryFn: async () => {
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
    queryKey: gameKeys.activeBooking(gameId),
    queryFn: async () => {
      const res = await GameService.getUserActiveBooking(gameId);

      if (!res.success) {
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
      queryClient.invalidateQueries({ queryKey: gameKeys.activeBooking("") });
      queryClient.invalidateQueries({ queryKey: ["game", "slots"] });
      queryClient.invalidateQueries({ queryKey: ["gameStats"] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { bookingId: string; gameId: string }) => GameService.cancelBooking(params.bookingId),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.activeBooking(params.gameId) });
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

export const useToggleGameActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => GameService.toggleGameActive(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    }
  });
}


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