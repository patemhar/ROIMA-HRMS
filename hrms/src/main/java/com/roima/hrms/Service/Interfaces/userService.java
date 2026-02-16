package com.roima.hrms.Service.Interfaces;

//import com.roima.hrms.Shared.Dtos.User;

import com.roima.hrms.Dtos.User.UserDetailResponse;

import java.util.UUID;

public interface userService {

    UserDetailResponse getUserDetails(UUID userId);
}
