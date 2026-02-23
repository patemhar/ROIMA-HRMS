package com.roima.hrms.Dtos.game;

import com.roima.hrms.Core.Enums.BookingRequestStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class UserActiveBookingDto {
    private UUID bookingId;
    private UUID slotId;
    private LocalDate slotDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingRequestStatus status;
    private String requestedBy;
    private LocalDateTime requestedAt;
    private List<String> participants; // List of participant names or ids
}
