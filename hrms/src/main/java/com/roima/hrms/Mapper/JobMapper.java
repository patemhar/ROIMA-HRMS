package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.Job;
import com.roima.hrms.Core.Enums.JobStatus;
import com.roima.hrms.Dtos.job.JobRequestDto;
import com.roima.hrms.Dtos.job.JobResponseDto;
import com.roima.hrms.Repositories.DepartmentRepository;
import com.roima.hrms.Repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JobMapper {

    private ModelMapper modelMapper;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public Job toEntity(JobRequestDto dto) {
        Job job = new Job();
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setJob_responsibilities(dto.getJob_responsibilities());
        job.setRequired_qualification(dto.getRequired_qualification());
        job.setEmployment_type(dto.getEmployment_type());
        job.setSalary_range(dto.getSalary_range());
        job.setApplication_deadline(dto.getApplication_deadline());
        job.setMin_experience(dto.getMin_experience());
        job.setLocation(dto.getLocation());
        job.setIsActive(true);

        // Mapping Relationships
        if (dto.getDepartment_id() != null) {
            job.setDepartment(departmentRepository.findById(dto.getDepartment_id())
                    .orElseThrow(() -> new RuntimeException("Department not found")));
        }

        if (dto.getDefault_reviewer_id() != null) {
            job.setDefault_reviewer(userRepository.findById(dto.getDefault_reviewer_id())
                    .orElseThrow(() -> new RuntimeException("Reviewer not found")));
        }

        return job;
    }

    public JobResponseDto toDto(Job entity) {
        JobResponseDto dto = new JobResponseDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setJob_responsibilities(entity.getJob_responsibilities());
        dto.setRequired_qualification(entity.getRequired_qualification());
        dto.setSalary_range(entity.getSalary_range());
        dto.setLocation(entity.getLocation());
        dto.setEmployment_type(entity.getEmployment_type());
        dto.setMin_experience(entity.getMin_experience());
        dto.setApplication_deadline(entity.getApplication_deadline());
        dto.setDepartmentName(entity.getDepartment() != null ? entity.getDepartment().getDepartment_name() : "N/A");
        dto.setDefault_reviewer(entity.getDefault_reviewer().getId().toString() + "-" + entity.getDefault_reviewer().getFirst_name() + " " + entity.getDefault_reviewer().getLast_name());
        dto.setCreatedBy(entity.getCreated_by().getId().toString() + "-" + entity.getCreated_by().getFirst_name() + " " + entity.getCreated_by().getLast_name());
        return dto;
    }
}


