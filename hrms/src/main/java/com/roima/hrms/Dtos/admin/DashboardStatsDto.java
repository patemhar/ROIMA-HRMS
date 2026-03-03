package com.roima.hrms.dtos.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
    private Long totalDepartments;
    private Long totalRoles;
    private Long totalTravels;
    private Long activeTravels;
    private Long totalJobs;
    private Long activeJobs;
    private Long totalGames;
    private Long totalPosts;
    private Long pendingBookingRequests;
    private Long totalTravelExpenses;
    private Long pendingExpenseApprovals;
}

