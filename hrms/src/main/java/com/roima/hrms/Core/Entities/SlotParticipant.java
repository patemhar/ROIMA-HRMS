package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "slot_participants",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"booking_id", "user_id"}
                )
        }
)
public class SlotParticipant extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_request_id", nullable = false)
    private SlotBookingRequest bookingRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}