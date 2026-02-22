import { apiClient } from "./apiClient";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/http";

type Schemas = components["schemas"];
type ApiResult<T> = Promise<ApiResponse<T>>;

class AchievementService {
  // Get achievement feed (all posts including system-generated celebrations)
  getAchievementFeed(): ApiResult<Schemas["PostDto"][]> {
    return apiClient.get<Schemas["PostDto"][]>("/achievements");
  }

  // Create a new post
  createPost(data: Schemas["CreatePostRequest"], files?: File[]): ApiResult<Schemas["PostDto"]> {
    const formData = new FormData();
    
    // Append request as JSON blob with correct content type
    const requestBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    formData.append("request", requestBlob);
    
    // Append files if provided
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }
    
    return apiClient.postForm<Schemas["PostDto"]>("/achievements", formData);
  }

  // Get post by ID
  getPostById(id: string): ApiResult<Schemas["PostDto"]> {
    return apiClient.get<Schemas["PostDto"]>(`/achievements/${id}`);
  }

  // Update post
  updatePost(id: string, data: Schemas["CreatePostRequest"]): ApiResult<Schemas["PostDto"]> {
    return apiClient.put<Schemas["PostDto"]>(`/achievements/${id}`, data);
  }

  // Delete post
  deletePost(id: string): ApiResult<void> {
    return apiClient.delete<void>(`/achievements/${id}`);
  }

  // Get posts by user
  getPostsByUser(userId: string): ApiResult<Schemas["PostDto"][]> {
    return apiClient.get<Schemas["PostDto"][]>(`/achievements/user/${userId}`);
  }

  // Get posts by tag
  getPostsByTag(tag: string): ApiResult<Schemas["PostDto"][]> {
    return apiClient.get<Schemas["PostDto"][]>(`/achievements/tag/${tag}`);
  }

  // Add comment to post
  addComment(postId: string, data: Schemas["CommentRequest"]): ApiResult<Schemas["CommentDto"]> {
    return apiClient.post<Schemas["CommentDto"]>(`/achievements/${postId}/comments`, data);
  }

  // Get comments for post
  getCommentsByPost(postId: string): ApiResult<Schemas["CommentDto"][]> {
    return apiClient.get<Schemas["CommentDto"][]>(`/achievements/${postId}/comments`);
  }

  // Update comment
  updateComment(commentId: string, data: Schemas["CommentRequest"]): ApiResult<Schemas["CommentDto"]> {
    return apiClient.put<Schemas["CommentDto"]>(`/achievements/comments/${commentId}`, data);
  }

  // Delete comment
  deleteComment(commentId: string): ApiResult<void> {
    return apiClient.delete<void>(`/achievements/comments/${commentId}`);
  }

  // Like post
  likePost(postId: string): ApiResult<void> {
    return apiClient.post<void>(`/achievements/${postId}/like`);
  }

  // Unlike post
  unlikePost(postId: string): ApiResult<void> {
    return apiClient.delete<void>(`/achievements/${postId}/like`);
  }

  // Get like count for post
  getLikeCount(postId: string): ApiResult<number> {
    return apiClient.get<number>(`/achievements/${postId}/likes/count`);
  }

  // Check if current user liked the post
  isPostLiked(postId: string): ApiResult<boolean> {
    return apiClient.get<boolean>(`/achievements/${postId}/liked`);
  }
}

export const achievementService = new AchievementService();