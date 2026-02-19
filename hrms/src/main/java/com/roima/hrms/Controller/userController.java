package com.roima.hrms.Controller;

import com.roima.hrms.Service.Interfaces.userService;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.User.UserDetailResponse;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequestMapping("/users")
@RequiredArgsConstructor
@RestController
public class userController {

    private final userService userService;
    private final SecurityUtil securityUtil;

    @GetMapping("/{userId}")
    public ApiResponse<UserDetailResponse> getUserDetails(@PathVariable UUID userId) {

        UserDetailResponse response;

        response = userService.getUserDetails(userId);

        return ApiResponse.success(response, "User Details Fetched Successfully.");
    }

    @GetMapping("/my")
    public ApiResponse<UserDetailResponse> getMyDetail() {

        var user = securityUtil.getCurrentUser();

        return ApiResponse.success(userService.getUserDetails(user.getId()), "User Details Fetched Successfully.");

    }

    @GetMapping("/all")
    public ApiResponse<List<UserDetailResponse>> getAllUsers() {

        var users = userService.getAllUsers();

        return ApiResponse.success(users, "Users Fetched successfully");
    }

//    @PatchMapping("/{userId}")
//    public ApiResponse<Void> updateUserDetails(
//            @PathVariable UUID userId
//    ) {
//
//        var currentUser = securityUtil.getCurrentUser();
//
//        if(userId != currentUser.getId() && !Objects.equals(currentUser.getRole().getName(), "HR")) {
//            return ApiResponse.error(null, "Access Denied");
//        }
//
//
//    }

}
