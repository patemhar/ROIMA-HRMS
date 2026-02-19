package com.roima.hrms.Dtos.job;

import com.roima.hrms.Core.Entities.Department;
import com.roima.hrms.Core.Entities.JobSharingRecord;
import com.roima.hrms.Core.Entities.Referral;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.JobStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
public class JobResponseDto {
    private UUID id;
    private String title;
    private String description;
    private String job_responsibilities;
    private String required_qualification;
    private String status;
    private String salary_range;
    private String location;
    private String employment_type;
    private String min_experience;
    private LocalDate application_deadline;
    private String departmentName;
    private String default_reviewer;
    private String createdBy;
}
