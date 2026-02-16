package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.TravelMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TravelMemberRepository extends JpaRepository<TravelMember, UUID> {

    boolean existsByTravelIdAndUserId(UUID travelId, UUID userId);

    List<TravelMember> findByTravelId(UUID travelId);
}
