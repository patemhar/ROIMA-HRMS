package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.TravelBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TravelBookingRepository extends JpaRepository<TravelBooking, UUID> {
    List<TravelBooking> findByTravelId(UUID traveId);
}
