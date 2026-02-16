package com.roima.hrms.Controller;

import com.roima.hrms.Service.Interfaces.userService;
import com.roima.hrms.Shared.Dtos.ApiResponse;
import com.roima.hrms.Shared.Dtos.User.UserDetailResponse;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
