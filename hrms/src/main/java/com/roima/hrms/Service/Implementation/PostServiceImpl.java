package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Post;
import com.roima.hrms.Core.Entities.PostMedia;
import com.roima.hrms.Core.Entities.Role;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.dtos.achievement.CreatePostRequest;
import com.roima.hrms.dtos.achievement.PostDto;
import com.roima.hrms.Mapper.PostMapper;
import com.roima.hrms.Repositories.PostMediaRepository;
import com.roima.hrms.Repositories.PostRepository;
import com.roima.hrms.Repositories.RoleRepository;
import com.roima.hrms.Repositories.UserRepository;
import com.roima.hrms.Service.Interfaces.CloudinaryService;
import com.roima.hrms.Service.Interfaces.PostService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SecurityUtil securityUtil;
    private final PostMapper postMapper;
    private final PostMediaRepository postMediaRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public PostDto createPost(CreatePostRequest request, MultipartFile[] files) throws IOException {
        User currentUser = securityUtil.getCurrentUser();

        Post post = new Post();
        post.setPostOwner(currentUser);
        post.setTitle(request.getTitle());
        post.setContent(request.getDescription());
        post.setTags(request.getTags());
        post.setActive(true);
        post.setSystemGenerated(false);

        // Set visibility role, default to all if not specified
        if (request.getVisibility() != null) {
            Role role = roleRepository.findById(UUID.fromString(request.getVisibility())).orElseThrow(() -> new RuntimeException("Role not found"));
            post.setVisibility_role(role);
        }

        Post savedPost = postRepository.save(post);

        // Handle media upload
        if (files != null && files.length > 0) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String url = cloudinaryService.uploadFile(file, "HRMS/Post Media");
                    if (url != null) {
                        PostMedia postMedia = new PostMedia();
                        postMedia.setPost(savedPost);
                        postMedia.setMedia_url(url);
                        postMediaRepository.save(postMedia);
                    }
                }
            }
        }

        return postMapper.toDto(savedPost, currentUser);
    }

    @Override
    public PostDto createSystemPost(String title, String content, String tags) {
        Post post = new Post();
        post.setPostOwner(null);
        post.setTitle(title);
        post.setContent(content);
        post.setTags(tags);
        post.setActive(true);
        post.setSystemGenerated(true);
        post.setVisibility_role(null); // visible to all

        Post savedPost = postRepository.save(post);
        return postMapper.toDto(savedPost, null); // No current user for system posts
    }

    @Override
    public List<PostDto> getAllPosts() {
        User currentUser = securityUtil.getCurrentUser();
        List<Post> posts = postRepository.findAllActivePosts();
        return posts.stream().map(post -> postMapper.toDto(post, currentUser)).collect(Collectors.toList());
    }

    @Override
    public List<PostDto> getPostsByUser(UUID userId) {
        User currentUser = securityUtil.getCurrentUser();
        List<Post> posts = postRepository.findActivePostsByUser(userId);
        return posts.stream().map(post -> postMapper.toDto(post, currentUser)).collect(Collectors.toList());
    }

    @Override
    public List<PostDto> getPostsByTag(String tag) {
        User currentUser = securityUtil.getCurrentUser();
        List<Post> posts = postRepository.findActivePostsByTag(tag);
        return posts.stream().map(post -> postMapper.toDto(post, currentUser)).collect(Collectors.toList());
    }

    @Override
    public PostDto getPostById(UUID postId) {
        User currentUser = securityUtil.getCurrentUser();
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        return postMapper.toDto(post, currentUser);
    }

    @Override
    public PostDto updatePost(UUID postId, CreatePostRequest request) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User currentUser = securityUtil.getCurrentUser();

        if (!post.getPostOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not authorized to update this post");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getDescription());
        post.setTags(request.getTags());

        var existingRole = roleRepository.findById(UUID.fromString(request.getVisibility())).orElseThrow(() -> new RuntimeException("No role found for visibility"));

        post.setVisibility_role(existingRole);

        Post updatedPost = postRepository.save(post);
        return postMapper.toDto(updatedPost, currentUser);
    }

    @Override
    public void deletePost(UUID postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User currentUser = securityUtil.getCurrentUser();

        boolean isOwner = post.getPostOwner().getId().equals(currentUser.getId());
        boolean isHR = currentUser.getRole().getName().equals("HR");

        if (!isOwner && !isHR) {
            throw new RuntimeException("Not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    @Override
    public void deactivatePost(UUID postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User currentUser = securityUtil.getCurrentUser();

        boolean isOwner = post.getPostOwner().getId().equals(currentUser.getId());
        boolean isHR = currentUser.getRole().getName().equals("HR");

        if (!isOwner && !isHR) {
            throw new RuntimeException("Not authorized to deactivate this post");
        }

        post.setActive(false);
        postRepository.save(post);
    }
}
