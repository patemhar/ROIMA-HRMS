package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(
        name = "slots",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"game_id", "slot_date", "start_time"}
                )
        }
)
public class SlotEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private GameEntity game;

    @Column(nullable = false)
    private LocalDate slotDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(nullable = false)
    private Integer maxPlayers;

    @OneToMany(mappedBy = "slot")
    private List<SlotBookingEntity> bookings;
}