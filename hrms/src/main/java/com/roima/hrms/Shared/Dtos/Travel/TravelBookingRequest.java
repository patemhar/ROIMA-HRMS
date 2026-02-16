package com.roima.hrms.Shared.Dtos.Travel;

import com.roima.hrms.Core.Entities.Travel;
import com.roima.hrms.Core.Enums.BookingType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
public class TravelBookingRequest {

    private UUID travel_id;

    private BookingType bookingType;

    private String provider_name;

    private String booking_reference;

    private BigDecimal amount;

    private String currency;

    private LocalDateTime start_dateTime;

    private LocalDateTime end_dateTime;
}
