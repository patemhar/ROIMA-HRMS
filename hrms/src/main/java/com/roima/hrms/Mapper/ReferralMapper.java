package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.Referral;
import com.roima.hrms.Dtos.job.ReferralResponseDto;
import org.springframework.stereotype.Component;

@Component
public class ReferralMapper {

    public ReferralResponseDto toDto(Referral referral) {
        ReferralResponseDto dto = new ReferralResponseDto();
        dto.setId(referral.getId());
        dto.setReferredBy(referral.getReferred_by().getFirst_name() + " " + referral.getReferred_by().getLast_name());
        dto.setJobTitle(referral.getJob().getTitle());
        dto.setName(referral.getName());
        dto.setDetails(referral.getDetails());
        dto.setDocUrl(referral.getDoc_url());
        dto.setCreatedAt(referral.getCreated_at());
        return dto;
    }
}
