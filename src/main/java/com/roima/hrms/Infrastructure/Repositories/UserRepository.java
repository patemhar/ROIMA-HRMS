package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @NativeQuery("SELECT * FROM users WHERE reports_to = ?1")
    List<User> findByReportsTo(UUID userId);
}
