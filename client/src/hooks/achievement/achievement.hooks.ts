import { achievementService } from "@/services/achievementService";
import { achievementKeys, normalCacheConfig } from "./types";
import { useAuth } from "@/store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { components } from "@/types/api";

type Schemas = components["schemas"];

// Get achievement feed (all posts including celebrations)
export const useGetAchievements = (
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: achievementKeys.list({ pageNumber, pageSize, searchTerm }),
    queryFn: async () => {
      const res = await achievementService.getAchievementFeed(
        pageNumber,
        pageSize,
        searchTerm
      );
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

// Like a comment
export const useLikeAchievementComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => achievementService.likeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
};

// Unlike a comment
export const useUnlikeAchievementComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => achievementService.unlikeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
};

// Get replies for a comment (on-demand)
export const useGetCommentReplies = (commentId: string) => {
  const isAuthenticated = useAuth(s => s.auth.isAuthenticated);

  return useQuery({
    queryKey: achievementKeys.replies(commentId),
    queryFn: async () => {
      const res = await achievementService.getReplies(commentId);
      if (!res.success || !res.data) throw new Error(res.errors || "Failed to fetch replies");
      return res.data;
    },
    enabled: !!commentId && isAuthenticated,
    ...normalCacheConfig,
  });
};

// Add reply to a comment
export const useAddCommentReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: Schemas["CommentRequest"] }) =>
      achievementService.addReply(commentId, data),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.replies(commentId) });
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
};

// Update a reply
export const useUpdateCommentReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, commentId, data }: { replyId: string; commentId: string; data: Schemas["CommentRequest"] }) =>
      achievementService.updateReply(replyId, data),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.replies(commentId) });
    },
  });
};

// Delete a reply
export const useDeleteCommentReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, commentId }: { replyId: string; commentId: string }) =>
      achievementService.deleteReply(replyId),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.replies(commentId) });
      queryClient.invalidateQueries({ queryKey: achievementKeys.all });
    },
  });
};

// Like a reply
export const useLikeCommentReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, commentId }: { replyId: string; commentId: string }) =>
      achievementService.likeReply(replyId),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.replies(commentId) });
    },
  });
};

// Unlike a reply
export const useUnlikeCommentReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ replyId, commentId }: { replyId: string; commentId: string }) =>
      achievementService.unlikeReply(replyId),
    onSuccess: (_, { commentId }) => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.replies(commentId) });
    },
  });
};