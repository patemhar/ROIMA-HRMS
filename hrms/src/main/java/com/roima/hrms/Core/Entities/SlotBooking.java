package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "slot_bookings")
public class SlotBooking extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private GameSlot slot;

    @OneToMany(mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<SlotParticipant> participants;
}
