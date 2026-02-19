package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.JobSharingRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface JobSharingRecordRepository extends JpaRepository<JobSharingRecord, UUID> {
}
