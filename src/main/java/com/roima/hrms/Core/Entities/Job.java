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
@Table(name = "jobs")
public class Job extends BaseEntity{

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
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User created_by;

    @OneToMany(mappedBy = "job", fetch = FetchType.LAZY)
    private Set<Referral> job_referrals = new HashSet<>();
}