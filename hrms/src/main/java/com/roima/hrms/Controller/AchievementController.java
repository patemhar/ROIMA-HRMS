package com.roima.hrms.Controller;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.dtos.ApiResponse;
import com.roima.hrms.dtos.achievement.*;
import com.roima.hrms.Service.Interfaces.*;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
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
    public ApiResponse<Page<PostDto>> getAchievementFeed(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search
    ) {
        return ApiResponse.success(achievementService.getAchievementFeed(page, size, search), "Achievement feed fetched successfully");
    }

    // Create post
    @PostMapping
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<PostDto> createPost(@RequestPart("request") @Valid CreatePostRequest request, @RequestParam(value = "files", required = false) MultipartFile[] files) throws IOException {
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
    public ApiResponse<PostDto> updatePost(@PathVariable UUID postId, @RequestBody @Valid CreatePostRequest request) {
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
    public ApiResponse<CommentDto> addComment(@PathVariable UUID postId, @RequestBody @Valid CommentRequest request) {
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
    public ApiResponse<CommentDto> updateComment(@PathVariable UUID commentId, @RequestBody @Valid CommentRequest request) {
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

    // Like comment
    @PostMapping("/comments/{commentId}/like")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> likeComment(@PathVariable UUID commentId) {
        commentService.likeComment(commentId);
        return ApiResponse.success(null, "Comment liked successfully");
    }

    // Unlike comment
    @DeleteMapping("/comments/{commentId}/like")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> unlikeComment(@PathVariable UUID commentId) {
        commentService.unlikeComment(commentId);
        return ApiResponse.success(null, "Comment unliked successfully");
    }

    // Add reply to comment (fetched on-demand)
    @PostMapping("/comments/{commentId}/replies")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<CommentReplyDto> addReply(@PathVariable UUID commentId, @RequestBody @Valid CommentRequest request) {
        return ApiResponse.success(commentService.addReply(commentId, request), "Reply added successfully");
    }

    // Get replies for a comment (called on-demand when user expands)
    @GetMapping("/comments/{commentId}/replies")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<List<CommentReplyDto>> getReplies(@PathVariable UUID commentId) {
        return ApiResponse.success(commentService.getRepliesByComment(commentId), "Replies fetched successfully");
    }

    // Update reply
    @PutMapping("/replies/{replyId}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<CommentReplyDto> updateReply(@PathVariable UUID replyId, @RequestBody @Valid CommentRequest request) {
        return ApiResponse.success(commentService.updateReply(replyId, request), "Reply updated successfully");
    }

    // Delete reply
    @DeleteMapping("/replies/{replyId}")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> deleteReply(@PathVariable UUID replyId) {
        commentService.deleteReply(replyId);
        return ApiResponse.success(null, "Reply deleted successfully");
    }

    // Like reply
    @PostMapping("/replies/{replyId}/like")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> likeReply(@PathVariable UUID replyId) {
        commentService.likeReply(replyId);
        return ApiResponse.success(null, "Reply liked successfully");
    }

    // Unlike reply
    @DeleteMapping("/replies/{replyId}/like")
    @PreAuthorize("hasAuthority('PER022')")
    public ApiResponse<Void> unlikeReply(@PathVariable UUID replyId) {
        commentService.unlikeReply(replyId);
        return ApiResponse.success(null, "Reply unliked successfully");
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
