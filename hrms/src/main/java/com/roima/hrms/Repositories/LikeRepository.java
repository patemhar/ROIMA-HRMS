package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LikeRepository extends JpaRepository<Like, UUID> {

    @Query("SELECT l FROM Like l WHERE l.post.id = :postId")
    List<Like> findActiveLikesByPostId(@Param("postId") UUID postId);

    @Query("SELECT l FROM Like l WHERE l.user.id = :userId AND l.post.id = :postId")
    Optional<Like> findByUserIdAndPostId(@Param("userId") UUID userId, @Param("postId") UUID postId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.post.id = :postId")
    long countActiveLikesByPostId(@Param("postId") UUID postId);
}
