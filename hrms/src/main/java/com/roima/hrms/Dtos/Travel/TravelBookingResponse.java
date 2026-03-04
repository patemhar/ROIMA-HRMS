package com.roima.hrms.dtos.Travel;

import com.roima.hrms.Core.Enums.BookingType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelBookingResponse {

    private UUID booking_id;

    private UUID travel_id;

    private BookingType bookingType;

    private String provider_name;

    private String booking_reference;

    private BigDecimal amount;

    private String currency;

    private LocalDateTime start_dateTime;

    private LocalDateTime end_dateTime;
}
