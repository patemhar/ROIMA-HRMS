package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, UUID> {
}
