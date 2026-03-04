package com.roima.hrms.dtos.game;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserCycleStatsDto {
    private UUID gameId;
    private String gameName;
    private LocalDateTime cycleStart;
    private LocalDateTime cycleEnd;
    private int playCount;
}
