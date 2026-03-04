package com.roima.hrms.dtos.Travel;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelUpdateRequest {

    @Size(min = 1, max = 50, message = "Title must be between 1 and 50 characters")
    private String title;

    @Size(min = 1, max = 500, message = "Description must be between 1 and 500 characters")
    private String description;

    private LocalDate start_date;

    private LocalDate end_date;

    @Size(min = 1, max = 100, message = "Destination must be between 1 and 100 characters")
    private String destination;


    private Double allowance;

    @AssertTrue(message = "End date must be after start date")
    private boolean isEndDateAfterStartDate() {
        return start_date != null && end_date != null && end_date.isAfter(start_date);
    }
}
