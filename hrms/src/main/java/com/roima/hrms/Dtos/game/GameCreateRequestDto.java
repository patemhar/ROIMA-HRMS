package com.roima.hrms.Dtos.game;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class GameCreateRequestDto {

    private String name;
    private String description;

    private LocalTime operatingStartTime;
    private LocalTime operatingEndTime;

    private Integer slotDurationMinutes;
    private Integer maxPlayers;

    private Boolean activeOnWeekends = false;
}
