package com.roima.hrms.Repositories;

import aj.org.objectweb.asm.commons.Remapper;
import com.roima.hrms.Core.Entities.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SystemConfigRepository extends JpaRepository<SystemConfig, UUID> {
    Optional<SystemConfig> findByKeyName(String defaultHrEmail);
}
