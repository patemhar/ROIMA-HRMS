package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    @Query("""
        SELECT j FROM Job j WHERE j.IsActive = true
        """)
    List<Job> findByIsActiveTrue();

    @Modifying
    @Query("""
        UPDATE Job j
        SET j.IsActive = false
        WHERE CURRENT_DATE > j.application_deadline AND j.IsActive = true
    """)
    void markJobAsInactive();
}
