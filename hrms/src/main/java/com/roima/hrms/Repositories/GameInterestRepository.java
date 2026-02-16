package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.GameInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GameInterestRepository extends JpaRepository<GameInterest, UUID> {
}
