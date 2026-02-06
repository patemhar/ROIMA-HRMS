package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "slot_booking")
public class SlotBookingEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private SlotEntity slot;

    @OneToMany(mappedBy = "booking",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<SlotParticipantEntity> participants;
}
