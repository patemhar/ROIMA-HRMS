package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.SlotBookingRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

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

}
