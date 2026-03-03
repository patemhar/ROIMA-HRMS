package com.roima.hrms.dtos.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SystemActivityDto {
    private Long recentLogins;
    private Long newUsersThisMonth;
    private Long newTravelsThisMonth;
    private Long newJobsThisMonth;
    private Long newPostsThisMonth;
}

