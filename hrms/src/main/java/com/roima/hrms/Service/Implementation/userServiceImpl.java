package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Exception.UserNotFoundException;
import com.roima.hrms.Repositories.UserRepository;
import com.roima.hrms.Mapper.UserMapper;
import com.roima.hrms.Service.Interfaces.userService;
import com.roima.hrms.Dtos.User.UserDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class userServiceImpl implements userService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

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


}
