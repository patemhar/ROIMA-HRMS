package com.roima.hrms.Dtos.job;

import com.roima.hrms.Core.Enums.JobStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class JobRequestDto {
    private String title;
    private String description;
    private String job_responsibilities;
    private String required_qualification;
    private String employment_type;
    private String salary_range;
    private JobStatus status; // JobStatus Enum as String
    private LocalDate application_deadline;
    private String min_experience;
    private String location;
    private boolean is_active;
    private UUID department_id;
    private UUID default_reviewer_id;
}