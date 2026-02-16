package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "games")
public class Game extends BaseEntity {

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
    private List<GameSlot> slots;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL)
    private Set<GameInterest> game_interests;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL)
    private Set<GameBookingCycle> game_cycle;
}