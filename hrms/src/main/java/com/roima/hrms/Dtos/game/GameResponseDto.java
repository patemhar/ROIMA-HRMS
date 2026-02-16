package com.roima.hrms.Dtos.game;

import java.time.LocalTime;
import java.util.UUID;

public class GameResponseDto {

    private UUID id;
    private String name;
    private String description;

    private LocalTime startTime;
    private LocalTime endTime;

    private Integer slotDurationMinutes;
    private Integer maxPlayersPerSlot;

    private Integer interestedCount;
}