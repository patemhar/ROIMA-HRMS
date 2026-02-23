
export const jobKeys = {

    all: ["job"] as const,

    allJobs: () => [jobKeys.all, "all" ] as const,

}

export const normalCacheConfig = {
  staleTime: 30 * 1000,
  gcTime: 2 * 60 * 1000,
  refetchOnWindowFocus: true,
  retry: 2,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;