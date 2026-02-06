package com.roima.hrms.Core.Entities;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

public class ReferralsEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "referred_by")
    private UserEntity referred_by;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private JobEntity job;

    private String name;

    private String details;

    private String doc_url;
}
