package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.SlotBookingRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlotBookingRequestRepository extends JpaRepository<SlotBookingRequest, UUID> {

    @Query("""
    SELECT sbr
    FROM SlotBookingRequest sbr
    WHERE sbr.slot.id = :slotId
    AND sbr.status = 'CONFIRMED'
    """)
    Optional<SlotBookingRequest> findConfirmed(UUID slotId);

    @Query("""
    SELECT sbr
    FROM SlotBookingRequest sbr
    WHERE sbr.slot.id = :slotId
    AND sbr.status IN ('PENDING','CONFIRMED')
    ORDER BY sbr.priorityScore ASC, sbr.requestedAt ASC
    """)
    List<SlotBookingRequest> getBestContender(UUID slotId, Pageable pageable);

    @Query("""
        SELECT COUNT(sb) FROM SlotBookingRequest sb
        WHERE sb.slot.id = :slotId
        AND sb.status IN ('PENDING', 'CONFIRMED')
    """)
    Integer getQueueCount(UUID slotId);

    @Query("""
        SELECT sbr FROM SlotBookingRequest sbr
        JOIN sbr.slot s
        JOIN SlotParticipant sp ON sp.bookingRequest = sbr
        WHERE sp.user.id = :userId
        AND s.game.id = :gameId
        AND sbr.status IN ('PENDING', 'CONFIRMED')
        AND (s.slotDate > CURRENT_DATE OR (s.slotDate = CURRENT_DATE AND s.endTime > CURRENT_TIME))
    """)
    Optional<SlotBookingRequest> findActiveBookingForUserAndGame(UUID userId, UUID gameId);

    @Modifying
    @Transactional
    @Query("UPDATE SlotBookingRequest s SET s.status = 'CONFIRMED' WHERE s.id = :id AND NOT EXISTS (SELECT 1 FROM SlotBookingRequest s2 WHERE s2.slot.id = s.slot.id AND s2.status = 'CONFIRMED')")
    int confirmIfNotExists(UUID id);
}
