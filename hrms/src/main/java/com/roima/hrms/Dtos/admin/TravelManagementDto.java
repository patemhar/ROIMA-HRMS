package com.roima.hrms.dtos.admin;

import com.roima.hrms.Core.Enums.TravelStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TravelManagementDto {
    private UUID id;
    private String title;
    private String description;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private TravelStatus status;
    private String createdByName;
    private UUID createdById;
    private Integer memberCount;
    private Integer itineraryCount;
    private Integer expenseCount;
    private Integer bookingCount;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

