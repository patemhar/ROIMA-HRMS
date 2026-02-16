package com.roima.hrms.Controller;

import com.cloudinary.Api;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.profile.ProfileAdminRequestDTO;
import com.roima.hrms.Dtos.profile.ProfileResponseDTO;
import com.roima.hrms.Dtos.profile.ProfileSelfUpdateDTO;
import com.roima.hrms.Service.Interfaces.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // hr create
    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public ApiResponse<ProfileResponseDTO> createProfile(
            @RequestBody ProfileAdminRequestDTO request) {

        return ApiResponse.success(
                profileService.createProfile(request),
                "Profile created successfully"
        );
    }

    // hr update
    @PatchMapping("/{profileId}")
    @PreAuthorize("hasRole('HR')")
    public ApiResponse<ProfileResponseDTO> updateProfile(
            @PathVariable UUID profileId,
            @RequestBody ProfileAdminRequestDTO request) {

        return ApiResponse.success(
                profileService.updateProfileByHR(profileId, request),
                "Profile updated successfully"
        );
    }

    // employee update own profile
    @PatchMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<ProfileResponseDTO> updateMyProfile(
            @RequestBody ProfileSelfUpdateDTO request) {

        return ApiResponse.success(
                profileService.updateMyProfile(request),
                "Profile updated successfully"
        );
    }

    @PostMapping("/me/avatar")
    @PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR')")
    public ApiResponse<Void> uploadAvatar (
            @RequestParam MultipartFile file
    ) throws IOException {
        profileService.updateAvatar(file);

        return ApiResponse.success(null, "Avatar uploaded successfully");
    }

    @GetMapping("/me")
    public ApiResponse<ProfileResponseDTO> getMyProfile() {
        return ApiResponse.success(
                profileService.getMyProfile(),
                "Profile fetched successfully"
        );
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('HR','MANAGER')")
    public ApiResponse<ProfileResponseDTO> getProfile(@PathVariable UUID userId) {
        return ApiResponse.success(
                profileService.getProfile(userId),
                "Profile fetched successfully"
        );
    }
}

