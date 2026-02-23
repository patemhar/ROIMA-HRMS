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
import java.util.List;
import java.util.UUID;

import com.roima.hrms.Dtos.game.UserCycleStatsDto;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    // hr create
    @PostMapping
    @PreAuthorize("hasAuthority('PER004')")
    public ApiResponse<ProfileResponseDTO> createProfile(
            @RequestBody ProfileAdminRequestDTO request) {
        return ApiResponse.success(profileService.createProfile(request), "Profile created successfully");
    }

    // hr update
    @PatchMapping("/{profileId}")
    @PreAuthorize("hasAuthority('PER004')")
    public ApiResponse<ProfileResponseDTO> updateProfile(
            @PathVariable UUID profileId,
            @RequestBody ProfileAdminRequestDTO request) {
        return ApiResponse.success(profileService.updateProfileByHR(profileId, request), "Profile updated successfully");
    }

    // employee update own profile
    @PatchMapping("/me")
    @PreAuthorize("hasAuthority('PER003')")
    public ApiResponse<ProfileResponseDTO> updateMyProfile(
            @RequestBody ProfileSelfUpdateDTO request) {
        return ApiResponse.success(profileService.updateMyProfile(request), "Profile updated successfully");
    }

    @PostMapping("/me/avatar")
    @PreAuthorize("hasAuthority('PER003')")
    public ApiResponse<Void> uploadAvatar(@RequestParam MultipartFile file) throws IOException {
        profileService.updateAvatar(file);
        return ApiResponse.success(null, "Avatar uploaded successfully");
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('PER003')")
    public ApiResponse<ProfileResponseDTO> getMyProfile() {
        return ApiResponse.success(profileService.getMyProfile(), "Profile fetched successfully");
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('PER004')")
    public ApiResponse<ProfileResponseDTO> getProfile(@PathVariable UUID userId) {
        return ApiResponse.success(profileService.getProfile(userId), "Profile fetched successfully");
    }

    @PostMapping("/interests/{gameId}")
    @PreAuthorize("hasAuthority('PER003')")
    public ApiResponse<Void> addInterest(@PathVariable UUID gameId) {
        profileService.addInterest(gameId);
        return ApiResponse.success(null, "Interest added successfully");
    }

    @DeleteMapping("/interests/{gameId}")
    @PreAuthorize("hasAuthority('PER003')")
    public ApiResponse<Void> deleteInterest(@PathVariable UUID gameId) {
        profileService.removeInterest(gameId);
        return ApiResponse.success(null, "Interest removed successfully");
    }

    @GetMapping("/game-stats")
    @PreAuthorize("hasAuthority('PER003')")
    public ApiResponse<List<UserCycleStatsDto>> getUserGameStats(@RequestParam(value = "latest", defaultValue = "false") boolean latest) {
        return ApiResponse.success(
                profileService.getUserGameStats(latest),
                latest ? "Current cycle game stats retrieved successfully" : "All game stats retrieved successfully"
        );
    }
}
