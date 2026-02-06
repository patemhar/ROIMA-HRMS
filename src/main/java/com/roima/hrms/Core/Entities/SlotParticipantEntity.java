package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

@Entity
@Table(
        name = "slot_participants",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"booking_id", "user_id"}
                )
        }
)
public class SlotParticipantEntity extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private SlotBookingEntity booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}