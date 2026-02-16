package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.Profile;
import com.roima.hrms.Dtos.profile.ProfileAdminRequestDTO;
import com.roima.hrms.Dtos.profile.ProfileResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

    public ProfileResponseDTO toDto(Profile profile) {

        ProfileResponseDTO dto = new ProfileResponseDTO();

        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());

        dto.setEmpNumber(profile.getEmp_number());
        dto.setPhone(profile.getPhone());
        dto.setBio(profile.getBio());
        dto.setLocation(profile.getLocation());
        dto.setAvatarUrl(profile.getAvatar_url());
        dto.setJoinedDate(profile.getJoined_date());

        if (profile.getDepartment() != null) {
            dto.setDepartmentId(profile.getDepartment().getId());
            dto.setDepartmentName(profile.getDepartment().getDepartment_name());
        }

        return dto;
    }

    public Profile updateProfile (Profile profile, ProfileAdminRequestDTO requestDTO) {

        if(requestDTO.getBio() != null) {
            profile.setBio(requestDTO.getBio());
        }
        if(requestDTO.getPhone() != null) {
            profile.setPhone(requestDTO.getPhone());
        }
        if(requestDTO.getLocation() != null) {
            profile.setLocation(requestDTO.getLocation());
        }
        if(requestDTO.getEmpNumber() != null) {
            profile.setEmp_number(requestDTO.getEmpNumber());
        }
        if(requestDTO.getJoinedDate() != null) {
            profile.setJoined_date(requestDTO.getJoinedDate());
        }

        return profile;

    }
}

