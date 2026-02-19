package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.GameBookingCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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
}
