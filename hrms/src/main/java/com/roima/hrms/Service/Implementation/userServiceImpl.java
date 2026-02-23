package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Exception.UserNotFoundException;
import com.roima.hrms.Repositories.UserRepository;
import com.roima.hrms.Mapper.UserMapper;
import com.roima.hrms.Service.Interfaces.userService;
import com.roima.hrms.Dtos.User.UserDetailResponse;
import com.roima.hrms.Dtos.User.UserSelfUpdateDTO;
import com.roima.hrms.Dtos.User.UserAdminUpdateDTO;
import com.roima.hrms.Core.Entities.Role;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Repositories.RoleRepository;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class userServiceImpl implements userService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SecurityUtil securityUtil;
    private final RoleRepository roleRepository;

    @Override
    public UserDetailResponse getUserDetails(UUID userId) {

        var existingUser = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("No user found for given id."));

        return userMapper.ToUserDetailResponse(existingUser);
    }

    @Override
    public List<UserDetailResponse> getAllUsers() {

        var users = userRepository.findAll();

        return users.stream().map(userMapper::ToUserDetailResponse).toList();
    }

    @Override
    public UserDetailResponse updateMyUser(UserSelfUpdateDTO request) {
        User currentUser = securityUtil.getCurrentUser();

        if (request.getFirstName() != null) {
            currentUser.setFirst_name(request.getFirstName());
        }
        if (request.getLastName() != null) {
            currentUser.setLast_name(request.getLastName());
        }
        if (request.getEmail() != null) {
            currentUser.setEmail(request.getEmail());
        }

        User savedUser = userRepository.save(currentUser);
        return userMapper.ToUserDetailResponse(savedUser);
    }

    @Override
    public UserDetailResponse updateUserByHR(UUID userId, UserAdminUpdateDTO request) {
        ensureHr(securityUtil.getCurrentUser());

        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("No user found for given id."));

        if (request.getFirstName() != null) {
            user.setFirst_name(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLast_name(request.getLastName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId()).orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }
        if (request.getReportsToId() != null) {
            User reportsTo = userRepository.findById(request.getReportsToId()).orElseThrow(() -> new UserNotFoundException("Reports to user not found"));
            user.setReports_to(reportsTo);
        }
        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }

        User savedUser = userRepository.save(user);
        return userMapper.ToUserDetailResponse(savedUser);
    }

    private void ensureHr(User user) {
        if (!"HR".equals(user.getRole().getName()))
            throw new RuntimeException("Only HR allowed");
    }
}
