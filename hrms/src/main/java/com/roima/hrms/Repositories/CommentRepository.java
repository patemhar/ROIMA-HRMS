package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId ORDER BY c.created_at ASC")
    List<Comment> findByPostId(@Param("postId") UUID postId);

    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId ORDER BY c.created_at DESC")
    List<Comment> findByUserId(@Param("userId") UUID userId);
}
