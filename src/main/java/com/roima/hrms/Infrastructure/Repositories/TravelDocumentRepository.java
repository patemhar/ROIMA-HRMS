package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.TravelDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TravelDocumentRepository extends JpaRepository<TravelDocument, UUID> {
}
