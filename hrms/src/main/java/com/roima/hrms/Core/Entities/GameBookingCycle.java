package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "game_cycles")
public class GameBookingCycle extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;

    private LocalDateTime cycle_start;

    private LocalDateTime cycle_end;

    @OneToMany(mappedBy = "game_cycle", fetch = FetchType.LAZY)
    private Set<GameSlot> cycle_slots = new HashSet<>();
}
