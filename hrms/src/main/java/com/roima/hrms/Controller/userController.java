package com.roima.hrms.Controller;

import com.roima.hrms.Service.Interfaces.userService;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.User.UserDetailResponse;
import com.roima.hrms.Dtos.User.UserSelfUpdateDTO;
import com.roima.hrms.Dtos.User.UserAdminUpdateDTO;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RequestMapping("/users")
@RequiredArgsConstructor
@RestController
public class userController {

    private final userService userService;
    private final SecurityUtil securityUtil;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<UserDetailResponse> getUserDetails(@PathVariable UUID userId) {

        UserDetailResponse response;

        response = userService.getUserDetails(userId);

        return ApiResponse.success(response, "User Details Fetched Successfully.");
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('PER001')")
    public ApiResponse<UserDetailResponse> getMyDetail() {

        var user = securityUtil.getCurrentUser();

        return ApiResponse.success(userService.getUserDetails(user.getId()), "User Details Fetched Successfully.");

    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<List<UserDetailResponse>> getAllUsers() {

        var users = userService.getAllUsers();

        return ApiResponse.success(users, "Users Fetched successfully");
    }

    @PatchMapping("/me")
    @PreAuthorize("hasAuthority('PER001')")
    public ApiResponse<UserDetailResponse> updateMyUser(@RequestBody UserSelfUpdateDTO request) {
        UserDetailResponse response = userService.updateMyUser(request);
        return ApiResponse.success(response, "User updated successfully");
    }

    @PatchMapping("/{userId}")
    @PreAuthorize("hasAuthority('PER002')")
    public ApiResponse<UserDetailResponse> updateUserByHR(@PathVariable UUID userId, @RequestBody UserAdminUpdateDTO request) {
        UserDetailResponse response = userService.updateUserByHR(userId, request);
        return ApiResponse.success(response, "User updated successfully");
    }
}
