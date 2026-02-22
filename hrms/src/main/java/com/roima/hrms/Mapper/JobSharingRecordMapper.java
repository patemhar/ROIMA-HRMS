package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.JobSharingRecord;
import com.roima.hrms.Dtos.job.JobSharingRecordResponseDto;
import org.springframework.stereotype.Component;

@Component
public class JobSharingRecordMapper {

    public JobSharingRecordResponseDto toDto(JobSharingRecord record) {
        JobSharingRecordResponseDto dto = new JobSharingRecordResponseDto();
        dto.setId(record.getId());
        dto.setSharedBy(record.getUser().getFirst_name() + " " + record.getUser().getLast_name());
        dto.setJobTitle(record.getJob().getTitle());
        dto.setEmail(record.getEmail());
        dto.setCreatedAt(record.getCreated_at());
        return dto;
    }
}
