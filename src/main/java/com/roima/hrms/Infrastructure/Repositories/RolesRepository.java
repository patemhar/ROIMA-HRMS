package com.roima.hrms.Infrastructure.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.management.relation.Role;
import java.util.UUID;

@Repository
public interface RolesRepository extends JpaRepository<Role, UUID> {
}
