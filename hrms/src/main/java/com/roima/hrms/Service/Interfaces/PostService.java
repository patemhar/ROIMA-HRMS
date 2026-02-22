package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Dtos.achievement.CreatePostRequest;
import com.roima.hrms.Dtos.achievement.PostDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface PostService {

    PostDto createPost(CreatePostRequest request, MultipartFile[] files) throws IOException;

    PostDto createSystemPost(String title, String content, String tags);

    List<PostDto> getAllPosts();

    List<PostDto> getPostsByUser(UUID userId);

    List<PostDto> getPostsByTag(String tag);

    PostDto getPostById(UUID postId);

    PostDto updatePost(UUID postId, CreatePostRequest request);

    void deletePost(UUID postId);

    void deactivatePost(UUID postId);
}
