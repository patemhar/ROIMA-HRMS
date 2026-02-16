package com.roima.hrms.Service.Interfaces;


import com.roima.hrms.Dtos.profile.ProfileAdminRequestDTO;
import com.roima.hrms.Dtos.profile.ProfileResponseDTO;
import com.roima.hrms.Dtos.profile.ProfileSelfUpdateDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

public interface ProfileService {

    ProfileResponseDTO createProfile(ProfileAdminRequestDTO request);

    ProfileResponseDTO updateProfileByHR(UUID profileId,
                                         ProfileAdminRequestDTO request);

    ProfileResponseDTO updateMyProfile(ProfileSelfUpdateDTO request);

    void updateAvatar(MultipartFile file) throws IOException;

    ProfileResponseDTO getMyProfile();

    ProfileResponseDTO getProfile(UUID userId);
}
