package com.roima.hrms.Dtos.game;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserCycleStatsDto {
    private String gameName;
    private LocalDateTime cycleStart;
    private LocalDateTime cycleEnd;
    private int playCount;
}
