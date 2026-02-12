package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.RefreshToken;
import com.roima.hrms.Core.Entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    @EntityGraph(attributePaths = {"user"})
    Optional<RefreshToken> findByTokenHash(String token);

    void deleteByUser(User user);


    @Modifying
    @Transactional
    @Query(value = "UPDATE refresh_tokens SET revoked_at = :revokedAt, replaced_by_token_hash = :replacedByTokenHash, reason_revoked = :reasonRevoked WHERE user_id = :userId AND revoked_at IS NULL", nativeQuery = true)
    int revokeAll(@Param("userId") UUID userId,
                           @Param("revokedAt") LocalDateTime revokedAt,
                           @Param("reasonRevoked") String reasonRevoked,
                           @Param("replacedByTokenHash") String replacedByTokenHash);
}
