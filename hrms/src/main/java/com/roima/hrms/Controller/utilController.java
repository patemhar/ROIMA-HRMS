package com.roima.hrms.Controller;

import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.Util.*;
import com.roima.hrms.Service.Interfaces.utilService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/util")
@RequiredArgsConstructor
public class utilController {

    private final utilService utilService;

    @GetMapping("/dept")
    @PreAuthorize("hasAuthority('PER019')")
    public ApiResponse<List<departmentOptions>> getAllDepartments() {
        return ApiResponse.success(utilService.getAllDepartments(), "Departments fetched successfully");
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('PER019')")
    public ApiResponse<List<userOptions>> getAllUsers() {
        return ApiResponse.success(utilService.getAllUsers(), "Users fetched successfully");
    }

    @GetMapping("/members/{travelId}")
    @PreAuthorize("hasAuthority('PER019')")
    public ApiResponse<List<userOptions>> getAllTravelMembers(@PathVariable UUID travelId) {
        return ApiResponse.success(utilService.getUsersOfTravel(travelId), "Travel members fetched successfully");
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('PER019')")
    public ApiResponse<List<roleOptions>> getAllRoles() {
        return ApiResponse.success(utilService.getRoles(), "Roles fetched successfully");
    }

    @GetMapping("/games")
    @PreAuthorize("hasAuthority('PER019')")
    public ApiResponse<List<gameOptions>> getAllGames() {
        return ApiResponse.success(utilService.getGames(), "Games fetched successfully");
    }
}
