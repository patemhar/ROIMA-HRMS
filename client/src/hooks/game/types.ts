export const gameKeys = {

    all: ["game"] as const,
    activeBooking: (gameId: string) => ["activeBooking", gameId] as const,
    cycleByGameId: (gameId: string) => ["cycle", gameId] as const, 
    gameById: (gameId: string) => ["games", gameId] as const,
    slotsByGame: (gameId: string, date: string) => ["game", "slots", gameId, date] as const,
    bookings: (pageNumber: number, pageSize: number, searchTerm?: string) => ["bookings", pageNumber, pageSize, searchTerm] as const,
}

export const normalCacheConfig = {
  staleTime: 30 * 1000,
  gcTime: 2 * 60 * 1000,
  refetchOnWindowFocus: true,
  retry: 2,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

export const smallCacheConfig = {
  staleTime: 5 * 1000,
  gcTime: 10 * 1000,
  refetchOnWindowFocus: false,
  retry: 1,
} as const;