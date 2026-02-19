package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.UserCycleStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserCycleStatsRepository extends JpaRepository<UserCycleStats, UUID> {

    @Query("""
        SELECT ucs
        FROM UserCycleStats ucs
        WHERE ucs.user.id = :userId
        AND ucs.gameCycle.id = :cycleId
        AND ucs.game.id = :gameId
    """)
    UserCycleStats getStatsByGameUserCycle(UUID gameID, UUID userID, UUID cycleId);

    boolean existsByUserIdAndGameCycleId(UUID userId, UUID cycleId);
}
