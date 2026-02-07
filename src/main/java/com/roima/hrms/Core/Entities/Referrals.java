package com.roima.hrms.Core.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "referrals")
public class Referrals extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "referred_by")
    private User referred_by;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    private String name;

    private String details;

    private String doc_url;
}
