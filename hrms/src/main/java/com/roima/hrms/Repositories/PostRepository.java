package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    @Query("SELECT p FROM Post p WHERE p.active = true AND (p.systemGenerated = true OR p.visibility_role IS NULL OR p.visibility_role.name IN :allowedRoles) ORDER BY p.created_at DESC")
    List<Post> findActivePostsByVisibility(@Param("allowedRoles") List<String> allowedRoles);
}
