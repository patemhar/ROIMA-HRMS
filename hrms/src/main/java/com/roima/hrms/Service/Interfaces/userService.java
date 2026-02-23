package com.roima.hrms.Service.Interfaces;

//import com.roima.hrms.Shared.Dtos.User;

import com.roima.hrms.Dtos.User.UserAdminUpdateDTO;
import com.roima.hrms.Dtos.User.UserDetailResponse;
import com.roima.hrms.Dtos.User.UserSelfUpdateDTO;

import java.util.List;
import java.util.UUID;

public interface userService {

    UserDetailResponse getUserDetails(UUID userId);

    List<UserDetailResponse> getAllUsers();

    UserDetailResponse updateMyUser(UserSelfUpdateDTO request);

    UserDetailResponse updateUserByHR(UUID userId, UserAdminUpdateDTO request);
}
