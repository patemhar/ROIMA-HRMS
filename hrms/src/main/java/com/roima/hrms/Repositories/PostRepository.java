package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    @Query("SELECT p FROM Post p WHERE p.active = true ORDER BY p.created_at DESC")
    List<Post> findAllActivePosts();

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.postOwner.id = :userId ORDER BY p.created_at DESC")
    List<Post> findActivePostsByUser(@Param("userId") UUID userId);

    @Query("SELECT p FROM Post p WHERE p.active = true AND p.tags LIKE %:tag% ORDER BY p.created_at DESC")
    List<Post> findActivePostsByTag(@Param("tag") String tag);

    @Query(value = "SELECT p.* FROM posts p LEFT JOIN roles r ON p.visibility_role = r.id WHERE p.is_active = 1 AND (p.is_system_generated = 1 OR r.name IN :allowedRoles) ORDER BY p.created_at DESC", nativeQuery = true)
    List<Post> findActivePostsByVisibility(@Param("allowedRoles") List<String> allowedRoles);

    @Query("SELECT COUNT(p) > 0 FROM Post p WHERE p.systemGenerated = true AND p.tags = :tag AND p.content LIKE %:userName% AND p.created_at >= :startOfDay AND p.created_at < :endOfDay")
    boolean existsCelebrationPostToday(@Param("tag") String tag, @Param("userName") String userName, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
}
