package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.Travel;
import com.roima.hrms.Core.Entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
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
            "travel_documents",
            "travel_bookings"
    })
    Optional<Travel> findWithDetailsById(UUID id);

    @Query(value = "SELECT * FROM travels JOIN travel_members ON travels.id = travel_members.travel_id JOIN users ON users.id = travel_members.user_id where users.id = ?1", nativeQuery = true)
    List<Travel> findByMemberUserId(UUID userId);

    List<Travel> findByCreatedById(UUID userId);

    @NativeQuery("SELECT * FROM travels JOIN travel_members ON travels.id = travel_members.travel_id JOIN users ON users.id = travel_members.user_id where users.reports_to = ?1")
    List<Travel> findByReportsTo(UUID user_id);
}