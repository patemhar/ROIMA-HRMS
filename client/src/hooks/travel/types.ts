
export const hrKeys = {
  all: ["hr"] as const,

  travels: () => [...hrKeys.all, "travels"] as const,

  // travel
  allTravels: (role: string, pageNumber?: number, pageSize?: number, searchTerm?: string) =>
    [...hrKeys.travels(), "all", role, pageNumber, pageSize, searchTerm] as const,

  myTravels: (userId: string, pageNumber: number, pageSize: number, searchTerm?: string) =>
    [...hrKeys.travels(), "my", userId, pageNumber, pageSize, searchTerm] as const,

  travelById: (travelId: string) =>
    [...hrKeys.travels(), "detail", travelId] as const,

  travelByUserId: (userId: string) =>
    [...hrKeys.travels(), "user", userId] as const,

  // travel members
  membersByTravelId: (travelId: string) =>
    [...hrKeys.travels(), "members", travelId] as const,

  // itineraries
  itineraryByTravelId: (travelId: string) =>
    [...hrKeys.travels(), "itinerary", travelId] as const,

  // bookings
  bookingByTravelId: (travelId: string) =>
    [...hrKeys.travels(), "booking", travelId] as const,

  // expenses
  expensesByTravelId: (travelId: string) =>
    [...hrKeys.travels(), "expenses", travelId] as const,

  expenseDocs: (expenseId: string) =>
    [...hrKeys.travels(), "expenseDocs", expenseId] as const,

  travelDocs: (travelId: string) =>
    [...hrKeys.travels(), "documents", travelId] as const,
};


// normal
export const normalCacheConfig = {
  staleTime: 30 * 1000,
  gcTime: 2 * 60 * 1000,
  refetchOnWindowFocus: true,
  retry: 2,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

// quick stale
export const aggressiveCacheConfig = {
  staleTime: 10 * 1000, 
  gcTime: 1 * 60 * 1000, 
  refetchOnWindowFocus: true,
  retry: 1,
} as const;

// fresh for longer
export const StableCacheConfig = {
  staleTime: 2 * 60 * 1000, 
  gcTime: 5 * 60 * 1000, 
  refetchOnWindowFocus: false,
  retry: 2,
} as const;
