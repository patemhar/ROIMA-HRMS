package com.roima.hrms.Service.Interfaces;

import java.util.UUID;

public interface LikeService {

    void likePost(UUID postId);

    void unlikePost(UUID postId);

    boolean isPostLikedByUser(UUID postId, UUID userId);

    long getLikeCount(UUID postId);
}
