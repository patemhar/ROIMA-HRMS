package com.roima.hrms.Controller;

import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.User.UserDetailResponse;
import com.roima.hrms.Service.Interfaces.OrgChartService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/org")
@RequiredArgsConstructor
public class OrgChartController {

    private final OrgChartService orgChartService;
    private final SecurityUtil securityUtil;

    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('PER018')")
    public ApiResponse<List<UserDetailResponse>> getDescendingLayer(
            @PathVariable UUID userId
    ) {

        var users = orgChartService.getNextLayer(userId);

        return ApiResponse.success(users, "users fetched successfully");
    }

    @GetMapping("/my-manager")
    public ApiResponse<UserDetailResponse> getMyAscendingNode() {
        var currentUser = securityUtil.getCurrentUser();
        var manager = orgChartService.getAscendingNode(currentUser.getId());
        return ApiResponse.success(manager, "Manager fetched successfully");
    }
}
