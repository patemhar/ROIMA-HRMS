package com.roima.hrms.Dtos.game;

import java.time.LocalTime;

public class GameCreateRequestDto {

    private String name;
    private String description;

    private LocalTime startTime;
    private LocalTime endTime;

    private Integer slotDurationMinutes;
    private Integer maxPlayersPerSlot;
}
