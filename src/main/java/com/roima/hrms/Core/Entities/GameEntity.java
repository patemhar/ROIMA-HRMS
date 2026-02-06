package com.roima.hrms.Core.Entities;

import com.roima.hrms.Core.Entities.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "games")
public class GameEntity extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private LocalTime operatingStartTime;

    @Column(nullable = false)
    private LocalTime operatingEndTime;

    @Column(nullable = false)
    private Integer slotDurationMinutes;

    @Column(nullable = false)
    private Integer maxPlayers;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL)
    private List<SlotEntity> slots;
}