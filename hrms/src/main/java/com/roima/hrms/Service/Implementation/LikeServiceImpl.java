package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Like;
import com.roima.hrms.Core.Entities.Post;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Repositories.LikeRepository;
import com.roima.hrms.Repositories.PostRepository;
import com.roima.hrms.Service.Interfaces.LikeService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final SecurityUtil securityUtil;

    @Override
    public void likePost(UUID postId) {
        User currentUser = securityUtil.getCurrentUser();
        Post post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        Optional<Like> existingLike = likeRepository.findByUserIdAndPostId(currentUser.getId(), postId);

        if (existingLike.isPresent()) {

        } else {
            Like like = new Like();
            like.setUser(currentUser);
            like.setPost(post);
            likeRepository.save(like);
        }
    }

    @Override
    public void unlikePost(UUID postId) {
        User currentUser = securityUtil.getCurrentUser();

        Optional<Like> existingLike = likeRepository.findByUserIdAndPostId(currentUser.getId(), postId);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
        }
    }

    @Override
    public boolean isPostLikedByUser(UUID postId, UUID userId) {
        Optional<Like> like = likeRepository.findByUserIdAndPostId(userId, postId);
        return like.isPresent();
    }

    @Override
    public long getLikeCount(UUID postId) {
        return likeRepository.countActiveLikesByPostId(postId);
    }
}
