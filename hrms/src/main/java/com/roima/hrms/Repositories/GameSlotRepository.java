package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.GameSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface GameSlotRepository extends JpaRepository<GameSlot, UUID> {

    @Query("""
        SELECT gs FROM GameSlot gs
        WHERE gs.game.id = :gameId AND gs.gameCycle.id = :cycleId AND gs.slotDate = :date
        ORDER BY gs.startTime
    """)
    List<GameSlot> findSlotByDate(UUID gameId, UUID cycleId, LocalDate date);

    @Query("""
        SELECT COUNT(*) FROM GameSlot gs
        WHERE gs.gameCycle.id = :cycleId
        """)
    Integer getTotalSlots(UUID cycleId);
}
