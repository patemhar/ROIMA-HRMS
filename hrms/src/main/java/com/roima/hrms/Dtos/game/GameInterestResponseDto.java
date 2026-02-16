package com.roima.hrms.Dtos.game;

import java.time.LocalDateTime;
import java.util.UUID;

public class GameInterestResponseDto {

    private UUID gameId;
    private UUID userId;
    private LocalDateTime interestedAt;
}