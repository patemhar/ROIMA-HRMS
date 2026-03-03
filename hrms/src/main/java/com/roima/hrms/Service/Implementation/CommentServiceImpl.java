package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.dtos.achievement.CommentDto;
import com.roima.hrms.dtos.achievement.CommentReplyDto;
import com.roima.hrms.dtos.achievement.CommentRequest;
import com.roima.hrms.Mapper.PostMapper;
import com.roima.hrms.Repositories.*;
import com.roima.hrms.Service.Interfaces.CommentService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final CommentReplyRepository commentReplyRepository;
    private final CommentReplyLikeRepository commentReplyLikeRepository;
    private final PostRepository postRepository;
    private final SecurityUtil securityUtil;
    private final PostMapper postMapper;

    // ─── Comment CRUD ────────────────────────────────────────────────────────────

    @Override
    public CommentDto addComment(UUID postId, CommentRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setUser(currentUser);
        comment.setPost(post);
        comment.setContent(request.getText());

        return postMapper.toCommentDto(commentRepository.save(comment), currentUser);
    }

    @Override
    public List<CommentDto> getCommentsByPost(UUID postId) {
        User currentUser = securityUtil.getCurrentUser();
        List<Comment> comments = commentRepository.findByPostId(postId);
        return postMapper.toCommentDtoList(comments, currentUser);
    }

    @Override
    public CommentDto updateComment(UUID commentId, CommentRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to update this comment");
        }

        comment.setContent(request.getText());
        return postMapper.toCommentDto(commentRepository.save(comment), currentUser);
    }

    @Override
    public void deleteComment(UUID commentId) {
        User currentUser = securityUtil.getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        boolean isOwner = comment.getUser().getId().equals(currentUser.getId());
        boolean isHR    = currentUser.getRole().getName().equals("HR");

        if (!isOwner && !isHR) {
            throw new RuntimeException("Not authorized to delete this comment");
        }
        commentRepository.delete(comment);
    }

    @Override
    public CommentDto getCommentById(UUID commentId) {
        User currentUser = securityUtil.getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        return postMapper.toCommentDto(comment, currentUser);
    }

    // ─── Comment Likes ───────────────────────────────────────────────────────────

    @Override
    public void likeComment(UUID commentId) {
        User currentUser = securityUtil.getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (commentLikeRepository.existsByCommentIdAndUserId(commentId, currentUser.getId())) {
            throw new RuntimeException("Already liked this comment");
        }

        CommentLike like = new CommentLike();
        like.setUser(currentUser);
        like.setComment(comment);
        commentLikeRepository.save(like);
    }

    @Override
    public void unlikeComment(UUID commentId) {
        User currentUser = securityUtil.getCurrentUser();
        CommentLike like = commentLikeRepository
                .findByCommentIdAndUserId(commentId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Like not found"));
        commentLikeRepository.delete(like);
    }

    // ─── Replies ─────────────────────────────────────────────────────────────────

    @Override
    public CommentReplyDto addReply(UUID commentId, CommentRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        CommentReply reply = new CommentReply();
        reply.setUser(currentUser);
        reply.setParentComment(comment);
        reply.setContent(request.getText());

        return postMapper.toCommentReplyDto(commentReplyRepository.save(reply), currentUser);
    }

    @Override
    public List<CommentReplyDto> getRepliesByComment(UUID commentId) {
        User currentUser = securityUtil.getCurrentUser();
        List<CommentReply> replies = commentReplyRepository.findByParentCommentId(commentId);
        return postMapper.toCommentReplyDtoList(replies, currentUser);
    }

    @Override
    public CommentReplyDto updateReply(UUID replyId, CommentRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        if (!reply.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to update this reply");
        }

        reply.setContent(request.getText());
        return postMapper.toCommentReplyDto(commentReplyRepository.save(reply), currentUser);
    }

    @Override
    public void deleteReply(UUID replyId) {
        User currentUser = securityUtil.getCurrentUser();
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        boolean isOwner = reply.getUser().getId().equals(currentUser.getId());
        boolean isHR    = currentUser.getRole().getName().equals("HR");

        if (!isOwner && !isHR) {
            throw new RuntimeException("Not authorized to delete this reply");
        }
        commentReplyRepository.delete(reply);
    }

    // ─── Reply Likes ─────────────────────────────────────────────────────────────

    @Override
    public void likeReply(UUID replyId) {
        User currentUser = securityUtil.getCurrentUser();
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));

        if (commentReplyLikeRepository.existsByReplyIdAndUserId(replyId, currentUser.getId())) {
            throw new RuntimeException("Already liked this reply");
        }

        CommentReplyLike like = new CommentReplyLike();
        like.setUser(currentUser);
        like.setCommentReply(reply);
        commentReplyLikeRepository.save(like);
    }

    @Override
    public void unlikeReply(UUID replyId) {
        User currentUser = securityUtil.getCurrentUser();
        CommentReplyLike like = commentReplyLikeRepository
                .findByReplyIdAndUserId(replyId, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Reply like not found"));
        commentReplyLikeRepository.delete(like);
    }
}
