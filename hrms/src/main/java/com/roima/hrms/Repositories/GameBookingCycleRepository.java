package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Game;
import com.roima.hrms.Core.Entities.GameBookingCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameBookingCycleRepository extends JpaRepository<GameBookingCycle, UUID> {

    @Query("""
        SELECT gbc
        FROM GameBookingCycle gbc
        WHERE gbc.game.id = :gameId
        AND CURRENT_TIMESTAMP BETWEEN gbc.cycle_start AND gbc.cycle_end
    """)
    Optional<GameBookingCycle> getCurrentCycle(UUID gameId);

    @Query("SELECT c FROM GameBookingCycle c WHERE c.game = :game ORDER BY c.cycle_end DESC LIMIT 1")
    Optional<GameBookingCycle> findLatestByGame(Game game);

    @Query("SELECT COUNT(c) > 0 FROM GameBookingCycle c WHERE c.game.id = :gameId AND c.cycle_start > :now")
    boolean existsFutureCycle(UUID gameId, LocalDateTime now);
}
