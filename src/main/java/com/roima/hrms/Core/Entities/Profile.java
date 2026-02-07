package com.roima.hrms.Core.Entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user_profiles")
public class Profile extends BaseEntity{

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String emp_nmuber;

    private String phone;

    private String bio;

    private String Location;

    private String avatar_url;

    private LocalDate joined_date;

    // department relation
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // hierarchy
    @ManyToOne
    @JoinColumn(name = "reports_to")
    private User reports_to;

}

