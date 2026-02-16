package com.roima.hrms.Core.Entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;


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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

}

