package com.roima.hrms.Dtos.game;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class SlotResponseDto {

    private UUID id;
    private UUID gameId;

    private LocalDate slotDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private Integer capacity;
    private Integer bookedCount;
}