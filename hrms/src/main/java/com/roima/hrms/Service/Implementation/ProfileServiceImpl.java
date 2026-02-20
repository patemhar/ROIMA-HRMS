package com.roima.hrms.Service.Implementation;


import com.roima.hrms.Core.Entities.Department;
import com.roima.hrms.Core.Entities.GameInterest;
import com.roima.hrms.Core.Entities.Profile;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.profile.ProfileAdminRequestDTO;
import com.roima.hrms.Dtos.profile.ProfileResponseDTO;
import com.roima.hrms.Dtos.profile.ProfileSelfUpdateDTO;
import com.roima.hrms.Exception.IOException;
import com.roima.hrms.Exception.ResourceNotFoundException;
import com.roima.hrms.Mapper.ProfileMapper;
import com.roima.hrms.Repositories.*;
import com.roima.hrms.Service.Interfaces.ProfileService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final ProfileMapper mapper;
    private final SecurityUtil securityUtil;
    private final CloudinaryServiceImpl cloudinaryService;
    private final GameInterestRepository gameInterestRepository;
    private final GameRepository gameRepository;

    private static final String PROFILE_NOT_FOUND = "Profile not found";
    private static final String ACCESS_DENIED = "Access denied";
    private static final String ONLY_HR_ALLOWED = "Only HR allowed";

    // hr create

    @Override
    public ProfileResponseDTO createProfile(ProfileAdminRequestDTO request) {

        ensureHr(securityUtil.getCurrentUser());

        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new RuntimeException(PROFILE_NOT_FOUND));

        Department dept = departmentRepository.findById(request.getDepartmentId()).orElseThrow(() -> new RuntimeException("Department not found"));

        Profile profile = new Profile();

        profile.setUser(user);
        profile.setEmp_number(request.getEmpNumber());
        profile.setDepartment(dept);
        profile.setJoined_date(request.getJoinedDate());

        profile.setPhone(request.getPhone());
        profile.setBio(request.getBio());
        profile.setLocation(request.getLocation());

        profileRepository.save(profile);

        return mapper.toDto(profile);
    }

    // hr update

    @Override
    public ProfileResponseDTO updateProfileByHR(UUID profileId,ProfileAdminRequestDTO request) {

        ensureHr(securityUtil.getCurrentUser());

        Profile profile = profileRepository.findById(profileId).orElseThrow(() -> new RuntimeException(PROFILE_NOT_FOUND));


        var updatedProfile = mapper.updateProfile(profile, request);

        if(request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId()).orElseThrow(() -> new RuntimeException("Department not found"));
            updatedProfile.setDepartment(dept);
        }

        return mapper.toDto(updatedProfile);
    }

    // self update

    @Override
    public ProfileResponseDTO updateMyProfile(ProfileSelfUpdateDTO request) {

        User currentUser = securityUtil.getCurrentUser();

        Profile profile = profileRepository.findByUserId(currentUser.getId()).orElseThrow(() -> new RuntimeException(PROFILE_NOT_FOUND));

        if(request.getPhone() != null) {
            profile.setPhone(request.getPhone());
        }
        if(request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if(request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }

        var savedProfile = profileRepository.save(profile);

        return mapper.toDto(savedProfile);
    }

    @Override
    public void updateAvatar(MultipartFile file) throws java.io.IOException {

        var currentUser = securityUtil.getCurrentUser();

        Profile profile = profileRepository.findByUserId(currentUser.getId()).orElseThrow(() -> new RuntimeException(PROFILE_NOT_FOUND));

        String imageUrl = cloudinaryService.uploadFile(file, null).describeConstable().orElseThrow(() -> new IOException("Error uploading avatar"));

        profile.setAvatar_url(imageUrl);

        profileRepository.save(profile);
    }

    // getter

    @Override
    public ProfileResponseDTO getMyProfile() {

        User currentUser = securityUtil.getCurrentUser();

        Profile profile = profileRepository.findByUserId(currentUser.getId()).orElseThrow(() -> new ResourceNotFoundException(PROFILE_NOT_FOUND));

        return mapper.toDto(profile);
    }

    @Override
    public ProfileResponseDTO getProfile(UUID userId) {

        User currentUser = securityUtil.getCurrentUser();
        String role = currentUser.getRole().getName();

        if (!role.equals("HR") && !role.equals("MANAGER") && !currentUser.getId().equals(userId)) {
            throw new ResourceNotFoundException(ACCESS_DENIED);
        }

        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(PROFILE_NOT_FOUND));

        return mapper.toDto(profile);
    }

    @Override
    public void addInterest(UUID gameId) {
        var currentUser = securityUtil.getCurrentUser();
        var existingGame = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found"));

        // Check if interest already exists
        if (gameInterestRepository.existsByUserAndGame(currentUser.getId(), gameId)) {
            return;
        }

        var gameInterest = new GameInterest();
        gameInterest.setUser(currentUser);
        gameInterest.setGame(existingGame);

        gameInterestRepository.save(gameInterest);
    }

    @Override
    public void removeInterest(UUID gameId) {
        gameInterestRepository.deleteInterest(securityUtil.getCurrentUser().getId(), gameId);
    }

    private void ensureHr(User user) {
        if (!"HR".equals(user.getRole().getName()))
            throw new ResourceNotFoundException(ONLY_HR_ALLOWED);
    }
}