package com.roima.hrms.dtos.achievement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentReplyDto {
    private UUID id;
    private UUID commentId;
    private UUID authorId;
    private String authorName;
    private String text;
    private LocalDateTime createdDate;
    private int likeCount;
    private boolean isLikedByCurrentUser;
}

