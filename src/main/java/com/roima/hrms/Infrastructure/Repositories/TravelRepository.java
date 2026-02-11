package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.Travel;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TravelRepository extends JpaRepository<Travel, UUID> {

    @EntityGraph(attributePaths = {
            "members",
            "itineraries",
            "expenses",
            "documents",
            "bookings"
    })
    Optional<Travel> findWithDetailsById(UUID id);

    @NativeQuery("SELECT * FROM travels JOIN travel_members ON travels.id = travel_members.travel_id JOIN users ON user.id = travel_member.user_id where user.id = ?1")
    List<Travel> findByMemberUserId(UUID userId);

    List<Travel> findByCreatedById(UUID userId);

}