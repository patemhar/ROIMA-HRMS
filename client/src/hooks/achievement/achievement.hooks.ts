import { achievementService } from "@/services/achievementService";
import { achievementKeys, normalCacheConfig } from "./types";
import { useAuth } from "@/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "@/types/api";

type Schemas = components["schemas"];

// Get achievement feed (all posts including celebrations)
export const useGetAchievements = () => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: achievementKeys.list({}),
    queryFn: async () => {
      const res = await achievementService.getAchievementFeed();
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch achievements");
      return res.data;
    },
    enabled: isAuthenticated,
    ...normalCacheConfig,
  });
};

// Get a single achievement by ID
export const useGetAchievement = (id: string) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: achievementKeys.detail(id),
    queryFn: async () => {
      const res = await achievementService.getPostById(id);
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch achievement");
      return res.data;
    },
    enabled: !!id && isAuthenticated,
    ...normalCacheConfig,
  });
};

// Create a new achievement post
export const useCreateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, files }: { data: Schemas["CreatePostRequest"]; files?: File[] }) =>
      achievementService.createPost(data, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
    },
  });
};

// Update an achievement post
export const useUpdateAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Schemas["CreatePostRequest"] }) =>
      achievementService.updatePost(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
    },
  });
};

// Delete an achievement post
export const useDeleteAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: achievementService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
    },
  });
};

// Like an achievement post
export const useLikeAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: achievementService.likePost,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
    },
  });
};

// Unlike an achievement post
export const useUnlikeAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: achievementService.unlikePost,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
    },
  });
};

// Get comments for an achievement
export const useGetAchievementComments = (id: string) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: achievementKeys.comments(id),
    queryFn: async () => {
      const res = await achievementService.getCommentsByPost(id);
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch comments");
      return res.data;
    },
    enabled: !!id && isAuthenticated,
    ...normalCacheConfig,
  });
};

// Add a comment to an achievement
export const useAddAchievementComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Schemas["CommentRequest"] }) =>
      achievementService.addComment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.comments(id) });
      queryClient.invalidateQueries({ queryKey: achievementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() });
    },
  });
};

// Update a comment
export const useUpdateAchievementComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: Schemas["CommentRequest"] }) =>
      achievementService.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
};

// Delete a comment
export const useDeleteAchievementComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: achievementService.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
};