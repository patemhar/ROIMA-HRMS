package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.GameSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GameSlotRepository extends JpaRepository<GameSlot, UUID> {
}
