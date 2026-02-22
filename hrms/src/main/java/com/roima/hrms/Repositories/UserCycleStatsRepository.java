package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.UserCycleStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserCycleStatsRepository extends JpaRepository<UserCycleStats, UUID> {

    @Query("SELECT ucs FROM UserCycleStats ucs WHERE ucs.user.id = ?1 AND ucs.gameCycle.id = ?2 AND ucs.game.id = ?3")
    UserCycleStats getStatsByGameUserCycle(UUID userId, UUID cycleId, UUID gameId);

    boolean existsByUserIdAndGameCycleId(UUID userId, UUID cycleId);

    List<UserCycleStats> findByUserId(UUID userId);
}
