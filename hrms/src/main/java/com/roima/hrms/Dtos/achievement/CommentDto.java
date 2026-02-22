package com.roima.hrms.Dtos.achievement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentDto {
    private UUID id;
    private UUID postId;
    private UUID authorId;
    private String authorName;
    private String text;
    private LocalDateTime createdDate;
}
