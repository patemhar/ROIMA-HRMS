package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.Comment;
import com.roima.hrms.Core.Entities.Post;
import com.roima.hrms.Core.Entities.PostMedia;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.achievement.CommentDto;
import com.roima.hrms.Dtos.achievement.PostDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PostMapper {

    public PostDto toDto(Post post, User currentUser) {
        PostDto dto = new PostDto();
        dto.setId(post.getId());
        if (post.getPostOwner() != null) {
            dto.setAuthorId(post.getPostOwner().getId());
            dto.setAuthorName(post.getPostOwner().getFirst_name() + " " + post.getPostOwner().getLast_name());
        } else {
            dto.setAuthorId(null);
            dto.setAuthorName("System");
        }
        dto.setTitle(post.getTitle());
        dto.setDescription(post.getContent());
        dto.setTags(post.getTags());
        dto.setCreatedDate(post.getCreated_at());
        dto.setVisibility(post.getVisibility_role() != null ? post.getVisibility_role().getName() : "All");
        dto.setSystemGenerated(post.isSystemGenerated());
        dto.setLikeCount(post.getLikes().size());
        dto.setCommentCount(post.getComments().size());
        dto.setMediaUrls(post.getMedia().stream().map(PostMedia::getMedia_url).toList());

        if (currentUser != null) {
            boolean liked = post.getLikes().stream()
                    .anyMatch(like -> like.getUser().getId().equals(currentUser.getId()));
            dto.setLikedByCurrentUser(liked);
        } else {
            dto.setLikedByCurrentUser(false);
        }

        return dto;
    }

    public CommentDto toCommentDto(Comment comment) {
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPost().getId());
        dto.setAuthorId(comment.getUser().getId());
        dto.setAuthorName(comment.getUser().getFirst_name() + " " + comment.getUser().getLast_name());
        dto.setText(comment.getContent());
        dto.setCreatedDate(comment.getCreated_at());
        return dto;
    }

    public List<CommentDto> toCommentDtoList(List<Comment> comments) {
        return comments.stream().map(this::toCommentDto).collect(Collectors.toList());
    }
}
