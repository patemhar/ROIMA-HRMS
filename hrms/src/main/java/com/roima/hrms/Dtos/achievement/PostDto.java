package com.roima.hrms.dtos.achievement;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private UUID id;
    private UUID authorId;
    private String authorName;
    private String title;
    private String description;
    private String tags;
    private LocalDateTime createdDate;
    private String visibility;
    private boolean isSystemGenerated;
    private int likeCount;
    private int commentCount;
    private List<CommentDto> comments;
    private Set<String> recentLikers;
    private boolean isLikedByCurrentUser;
    private List<String> mediaUrls;
}
