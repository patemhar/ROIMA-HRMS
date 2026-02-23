package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Comment;
import com.roima.hrms.Core.Entities.Post;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.achievement.CommentDto;
import com.roima.hrms.Dtos.achievement.CommentRequest;
import com.roima.hrms.Mapper.PostMapper;
import com.roima.hrms.Repositories.CommentRepository;
import com.roima.hrms.Repositories.PostRepository;
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
    private final PostRepository postRepository;
    private final SecurityUtil securityUtil;
    private final PostMapper postMapper;

    @Override
    public CommentDto addComment(UUID postId, CommentRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setUser(currentUser);
        comment.setPost(post);
        comment.setContent(request.getText());

        Comment savedComment = commentRepository.save(comment);
        return postMapper.toCommentDto(savedComment);
    }

    @Override
    public List<CommentDto> getCommentsByPost(UUID postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);
        return postMapper.toCommentDtoList(comments);
    }

    @Override
    public CommentDto updateComment(UUID commentId, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        User currentUser = securityUtil.getCurrentUser();

        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to update this comment");
        }

        comment.setContent(request.getText());
        Comment updatedComment = commentRepository.save(comment);
        return postMapper.toCommentDto(updatedComment);
    }

    @Override
    public void deleteComment(UUID commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        User currentUser = securityUtil.getCurrentUser();

        boolean isOwner = comment.getUser().getId().equals(currentUser.getId());
        boolean isHR = currentUser.getRole().getName().equals("HR");

        if (!isOwner && !isHR) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Override
    public CommentDto getCommentById(UUID commentId) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        return postMapper.toCommentDto(comment);
    }
}
