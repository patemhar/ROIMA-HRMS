package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class JobEntity extends BaseEntity{

    private String title;

    private String description;

    private String job_responsibilities;

    private String required_qualification;

    private String employment_type;

    private String salary_range;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    private LocalDate application_deadline;

    private String min_experience;

    private String location;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private DepartmentEntity department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity created_by;

    @OneToMany(mappedBy = "job", fetch = FetchType.LAZY)
    private Set<JobEntity> job_referrals = new HashSet<>();
}