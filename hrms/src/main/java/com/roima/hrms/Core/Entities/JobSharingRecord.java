package com.roima.hrms.Core.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "job_sharing_record")
public class JobSharingRecord extends BaseEntity {

//    SharedBy, Email, DateTime, Job ID.

    @ManyToOne
    @JoinColumn(name = "shared_by")
    private User user;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    private String email;
}
