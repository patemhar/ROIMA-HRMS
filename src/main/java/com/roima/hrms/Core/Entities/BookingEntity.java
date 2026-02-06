package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "travel_bookings")
public class BookingEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_id")
    private TravelEntity travel;

    @Enumerated(EnumType.STRING)
    private BookingType bookingType;

    private String provider_name;

    private String booking_reference;

    private BigDecimal amount;

    private String currency;

    private LocalDateTime start_dateTime;

    private LocalDateTime end_dateTime;
}