package com.roima.hrms.Dtos.Travel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 50, message = "Title must be between 1 and 50 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 1, max = 500, message = "Description must be between 1 and 500 characters")
    private String description;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDate start_date;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDate end_date;

    @NotBlank(message = "Destination is required")
    @Size(min = 1, max = 100, message = "Destination must be between 1 and 100 characters")
    private String destination;

    @AssertTrue(message = "End date must be after start date")
    private boolean isEndDateAfterStartDate() {
        return end_date.isAfter(start_date);
    }
}
