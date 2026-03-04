package com.roima.hrms.dtos.game;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
public class SlotResponseDto {

    private UUID id;

    private UUID gameId;

    private LocalDate slotDate;

    private LocalTime startTime;
    private LocalTime endTime;

    private Boolean booked;

    private Integer bookingPriority;

    private Long queueCount;
}