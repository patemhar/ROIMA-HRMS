package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.UserCycleStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserCycleStatsRepository extends JpaRepository<UserCycleStats, UUID> {
}
