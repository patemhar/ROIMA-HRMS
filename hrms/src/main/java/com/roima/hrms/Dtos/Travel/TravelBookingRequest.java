package com.roima.hrms.dtos.Travel;

import com.roima.hrms.Core.Enums.BookingType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelBookingRequest {

    @NotNull(message = "Travel ID is required")
    private UUID travel_id;

    @NotNull(message = "Booking type is required")
    private BookingType bookingType;

    @NotBlank(message = "Provider name is required")
    @Size(min = 1, max = 100, message = "Provider name must be between 1 and 100 characters")
    private String provider_name;

    @NotBlank(message = "Booking reference is required")
    @Size(min = 1, max = 100, message = "Booking reference must be between 1 and 100 characters")
    private String booking_reference;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Currency is required")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be a valid 3-letter ISO code")
    private String currency;

    @NotNull(message = "Start date time is required")
    @Future(message = "Start date time must be in the future")
    private LocalDateTime start_dateTime;

    @NotNull(message = "End date time is required")
    @Future(message = "End date time must be in the future")
    private LocalDateTime end_dateTime;

    @AssertTrue(message = "End date time must be after start date time")
    private boolean isEndDateTimeAfterStartDateTime() {
        return end_dateTime.isAfter(start_dateTime);
    }
}
