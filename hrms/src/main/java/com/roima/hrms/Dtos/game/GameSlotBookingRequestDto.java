package com.roima.hrms.Dtos.game;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Setter
@Getter
public class GameSlotBookingRequestDto {

    private UUID slotId;

    private List<UUID> participants;
}
