package com.roima.hrms.Controller;

import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.Util.departmentOptions;
import com.roima.hrms.Dtos.Util.gameOptions;
import com.roima.hrms.Dtos.Util.roleOptions;
import com.roima.hrms.Dtos.Util.userOptions;
import com.roima.hrms.Service.Interfaces.utilService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("api/util")
@RequiredArgsConstructor
public class utilController {

    private final utilService utilService;

    @GetMapping("/dept")
    public ApiResponse<List<departmentOptions>> getAllDepartments() {
        return ApiResponse.success(utilService.getAllDepartments(), "Departments fetched successfully");
    }

    @GetMapping("/users")
    public ApiResponse<List<userOptions>> getAllUsers() {
        return ApiResponse.success(utilService.getAllUsers(), "Users fetched successfully");
    }

    @GetMapping("/members/{travelId}")
    public ApiResponse<List<userOptions>> getAllTravelMembers(
            @PathVariable UUID travelId
    ) {
        return ApiResponse.success(utilService.getUsersOfTravel(travelId), "departments fetched successfully");
    }

    @GetMapping("/roles")
    public ApiResponse<List<roleOptions>> getAllRoles() {
        return ApiResponse.success(utilService.getRoles(), "Roles fetched successfully");
    }

    @GetMapping("/games")
    public ApiResponse<List<gameOptions>> getAllGames() {
        return ApiResponse.success(utilService.getGames(), "Games fetched successfully");
    }
}
