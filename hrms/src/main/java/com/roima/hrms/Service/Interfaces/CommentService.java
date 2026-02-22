package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Dtos.achievement.CommentDto;
import com.roima.hrms.Dtos.achievement.CommentRequest;

import java.util.List;
import java.util.UUID;

public interface CommentService {

    CommentDto addComment(UUID postId, CommentRequest request);

    List<CommentDto> getCommentsByPost(UUID postId);

    CommentDto updateComment(UUID commentId, CommentRequest request);

    void deleteComment(UUID commentId);

    CommentDto getCommentById(UUID commentId);
}
