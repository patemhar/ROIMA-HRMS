package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.SlotParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlotParticipantRepository extends JpaRepository<SlotParticipant, UUID> {

    @Query("""
        SELECT COUNT(sp) > 0
        FROM SlotParticipant sp 
        JOIN sp.bookingRequest br
        JOIN br.slot s
        WHERE sp.user.id IN :userIds
        AND br.status IN ('PENDING', 'CONFIRMED')
        AND s.startTime > CURRENT_TIMESTAMP
    """)
    boolean existsActiveFutureBooking(List<UUID> userIds);

    @Query("""
        SELECT sp FROM SlotParticipant sp
        WHERE sp.bookingRequest.id = :requestId
    """)
    Optional<List<SlotParticipant>> findByRequestId(UUID requestId);
}
