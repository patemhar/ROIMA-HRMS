package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Travel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    @Query("""
            SELECT DISTINCT t
            FROM Travel t
            JOIN t.members m
            WHERE m.user.id = :userId AND t.active = true
            """)
    List<Travel> findByMemberUserId(UUID userId);

    @Query("SELECT t FROM Travel t WHERE t.createdBy.id = :userId AND t.active = true")
    List<Travel> findByCreatedById(UUID userId);

//    @NativeQuery("SELECT * FROM travels JOIN travel_members ON travels.id = travel_members.travel_id JOIN users ON users.id = travel_members.user_id where users.reports_to = ?1")

    @Query("""
            SELECT DISTINCT t
            FROM Travel t
            JOIN t.members m
            WHERE m.user.reports_to.id = ?1 AND t.active = true
            """)
    List<Travel> findByReportsTo(UUID userId);

    @Query("""
            SELECT DISTINCT t
            FROM Travel t
            JOIN t.members m
            WHERE m.user.id = :userId AND t.active = true
            AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.destination) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.createdBy.first_name) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Travel> findByMemberUserId(UUID userId, String search, Pageable pageable);

    @Query("""
            SELECT DISTINCT t
            FROM Travel t
            JOIN t.members m
            WHERE m.user.reports_to.id = :userId AND t.active = true
            AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.destination) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.createdBy.first_name) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Travel> findByReportsTo(UUID userId, String search, Pageable pageable);

    @Query("""
            SELECT t FROM Travel t WHERE t.active = true
            AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.destination) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.createdBy.first_name) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Travel> findAllActive(String search, Pageable pageable);

    @Query("""
            SELECT t FROM Travel t WHERE (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.destination) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(t.createdBy.first_name) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Travel> findAll(String search, Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Travel t
        SET t.status = CASE
            WHEN t.end_date >= CURRENT_DATE AND t.start_date <= CURRENT_DATE THEN 'ONGOING'
            WHEN t.end_date < CURRENT_DATE THEN 'COMPLETED'
            WHEN t.start_date > CURRENT_DATE THEN 'PLANNED'
            ELSE 'CANCELLED'
        END
        """)
    void updateStatus();

}