package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.UserCycleStats;
import com.roima.hrms.Dtos.game.UserCycleStatsDto;
import org.springframework.stereotype.Component;

@Component
public class UserCycleStatsMapper {

    public UserCycleStatsDto toDto(UserCycleStats entity) {
        UserCycleStatsDto dto = new UserCycleStatsDto();
        dto.setGameName(entity.getGame().getName());
        dto.setCycleStart(entity.getGameCycle().getCycle_start());
        dto.setCycleEnd(entity.getGameCycle().getCycle_end());
        dto.setPlayCount(entity.getPlayCount());
        return dto;
    }
}
