package com.roima.hrms.Controller;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.achievement.*;
import com.roima.hrms.Service.Interfaces.*;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import com.roima.hrms.Repositories.UserRepository;

@RestController
@RequestMapping("/achievements")
@RequiredArgsConstructor
public class AchievementController {

    private final PostService postService;
    private final CommentService commentService;
    private final LikeService likeService;
    private final AchievementService achievementService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;

    // Get achievement feed
    @GetMapping
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<List<PostDto>> getAchievementFeed() {
        return ApiResponse.success(achievementService.getAchievementFeed(), "Achievement feed fetched successfully");
    }

    // Create post
    @PostMapping
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<PostDto> createPost(@RequestPart("request") CreatePostRequest request, @RequestParam(value = "files", required = false) MultipartFile[] files) throws IOException {
        return ApiResponse.success(postService.createPost(request, files), "Post created successfully");
    }

    // Get post by ID
    @GetMapping("/{postId}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<PostDto> getPost(@PathVariable UUID postId) {
        return ApiResponse.success(postService.getPostById(postId), "Post fetched successfully");
    }

    // Update post
    @PutMapping("/{postId}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<PostDto> updatePost(@PathVariable UUID postId, @RequestBody CreatePostRequest request) {
        return ApiResponse.success(postService.updatePost(postId, request), "Post updated successfully");
    }

    // Delete post
    @DeleteMapping("/{postId}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> deletePost(@PathVariable UUID postId) {
        PostDto post = postService.getPostById(postId);
        User currentUser = securityUtil.getCurrentUser();

        if (currentUser.getRole().getName().equals("HR") && !post.getAuthorId().equals(currentUser.getId())) {
            User author = userRepository.findById(post.getAuthorId()).orElse(null);
            if (author != null) {
                emailService.sendSimpleMail(author.getEmail(), "Content Warning",
                    "Your post has been deleted by HR for violating community guidelines.");
            }
        }

        postService.deletePost(postId);
        return ApiResponse.success(null, "Post deleted successfully");
    }

    // Get posts by user
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<List<PostDto>> getPostsByUser(@PathVariable UUID userId) {
        return ApiResponse.success(postService.getPostsByUser(userId), "Posts fetched successfully");
    }

    // Get posts by tag
    @GetMapping("/tag/{tag}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<List<PostDto>> getPostsByTag(@PathVariable String tag) {
        return ApiResponse.success(postService.getPostsByTag(tag), "Posts fetched successfully");
    }

    // Add comment
    @PostMapping("/{postId}/comments")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<CommentDto> addComment(@PathVariable UUID postId, @RequestBody CommentRequest request) {
        return ApiResponse.success(commentService.addComment(postId, request), "Comment added successfully");
    }

    // Get comments for post
    @GetMapping("/{postId}/comments")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<List<CommentDto>> getComments(@PathVariable UUID postId) {
        return ApiResponse.success(commentService.getCommentsByPost(postId), "Comments fetched successfully");
    }

    // Update comment
    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<CommentDto> updateComment(@PathVariable UUID commentId, @RequestBody CommentRequest request) {
        return ApiResponse.success(commentService.updateComment(commentId, request), "Comment updated successfully");
    }

    // Delete comment
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> deleteComment(@PathVariable UUID commentId) {
        CommentDto comment = commentService.getCommentById(commentId);
        User currentUser = securityUtil.getCurrentUser();
        if (currentUser.getRole().getName().equals("HR") && !comment.getAuthorId().equals(currentUser.getId())) {
            User author = userRepository.findById(comment.getAuthorId()).orElse(null);
            if (author != null) {
                emailService.sendSimpleMail(author.getEmail(), "Content Warning",
                    "Your comment has been deleted by HR for violating community guidelines.");
            }
        }

        commentService.deleteComment(commentId);
        return ApiResponse.success(null, "Comment deleted successfully");
    }

    // Like post
    @PostMapping("/{postId}/like")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> likePost(@PathVariable UUID postId) {
        likeService.likePost(postId);
        return ApiResponse.success(null, "Post liked successfully");
    }

    // Unlike post
    @DeleteMapping("/{postId}/like")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> unlikePost(@PathVariable UUID postId) {
        likeService.unlikePost(postId);
        return ApiResponse.success(null, "Post unliked successfully");
    }

    // Get like count
    @GetMapping("/{postId}/likes/count")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Long> getLikeCount(@PathVariable UUID postId) {
        return ApiResponse.success(likeService.getLikeCount(postId), "Like count fetched successfully");
    }

    // Check if current user liked the post
    @GetMapping("/{postId}/liked")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Boolean> isPostLiked(@PathVariable UUID postId) {
        User currentUser = securityUtil.getCurrentUser();
        boolean liked = likeService.isPostLikedByUser(postId, currentUser.getId());
        return ApiResponse.success(liked, "Like status fetched successfully");
    }
}
