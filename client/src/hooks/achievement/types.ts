// Query keys for achievements
export const achievementKeys = {
  all: ["achievements"] as const,
  lists: () => [...achievementKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...achievementKeys.lists(), filters] as const,
  details: () => [...achievementKeys.all, "detail"] as const,
  detail: (id: string) => [...achievementKeys.details(), id] as const,
  comments: (id: string) => [...achievementKeys.detail(id), "comments"] as const,
  replies: (commentId: string) => [...achievementKeys.all, "comment", commentId, "replies"] as const,
  celebrations: () => [...achievementKeys.all, "celebrations"] as const,
};

// Cache config
export const normalCacheConfig = {
  staleTime: 30 * 1000,
  gcTime: 2 * 60 * 1000,
  refetchOnWindowFocus: true,
  retry: 2,
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};