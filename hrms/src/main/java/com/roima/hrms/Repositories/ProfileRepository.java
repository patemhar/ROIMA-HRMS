package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByUserId (UUID userId);

    @Query("SELECT p FROM Profile p WHERE MONTH(p.date_of_birth) = :month AND DAY(p.date_of_birth) = :day")
    List<Profile> findBirthdaysByMonthAndDay(@Param("month") int month, @Param("day") int day);

    @Query("SELECT p FROM Profile p WHERE MONTH(p.joined_date) = :month AND DAY(p.joined_date) = :day")
    List<Profile> findAnniversariesByMonthAndDay(@Param("month") int month, @Param("day") int day);
}
