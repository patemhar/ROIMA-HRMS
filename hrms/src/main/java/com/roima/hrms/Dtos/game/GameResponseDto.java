package com.roima.hrms.dtos.game;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
public class GameResponseDto {

    private UUID id;
    private String name;
    private String description;

    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean activeOnWeekends;
    private Boolean active;

    private Integer slotDurationMinutes;
    private Integer maxPlayersPerSlot;

    private Integer interestedCount;
}