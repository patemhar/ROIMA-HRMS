package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Dtos.User.UserDetailResponse;
import com.roima.hrms.Mapper.UserMapper;
import com.roima.hrms.Repositories.UserRepository;
import com.roima.hrms.Service.Interfaces.OrgChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrgChartServiceImpl implements OrgChartService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public List<UserDetailResponse> getNextLayer(UUID userId) {

        var users = userRepository.findByReportsTo(userId);

        var userSummary = users.stream().map(user -> userMapper.ToUserDetailResponse(user)).toList();

        return userSummary;
    }

    @Override
    public UserDetailResponse getAscendingNode(UUID userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getReports_to() == null) {
            throw new RuntimeException("User has no manager/superior");
        }

        var manager = userRepository.findById(user.getReports_to().getId())
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        return userMapper.ToUserDetailResponse(manager);
    }
}
