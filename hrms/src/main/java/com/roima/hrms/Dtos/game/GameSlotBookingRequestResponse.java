package com.roima.hrms.Dtos.game;

import com.roima.hrms.Core.Enums.BookingRequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class GameSlotBookingRequestResponse {

    private UUID slotRequestId;

    private String requestedBy;

    private LocalDateTime requestedAt;

    private BookingRequestStatus status;

}
