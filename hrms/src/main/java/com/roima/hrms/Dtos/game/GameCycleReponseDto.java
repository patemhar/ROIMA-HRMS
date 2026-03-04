package com.roima.hrms.dtos.game;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class GameCycleReponseDto {

    private UUID cycleId;

    private LocalDateTime cycle_start;

    private LocalDateTime cycle_end;

    private Integer total_slots;
}
