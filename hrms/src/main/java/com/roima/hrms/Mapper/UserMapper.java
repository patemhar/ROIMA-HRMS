package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.User.UserDetailResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDetailResponse ToUserDetailResponse(User user) {

        var userDetailResponse = new UserDetailResponse();

        userDetailResponse.setId(user.getId());
        userDetailResponse.setName(user.getFirst_name() + " " + user.getLast_name());
        userDetailResponse.setEmail(user.getEmail());
        userDetailResponse.setRole(user.getRole().getName());
        userDetailResponse.set_active(user.is_active());
        userDetailResponse.setLast_login(user.getLast_login());

        if(user.getReports_to() != null) {

            userDetailResponse.setReports_to(user.getReports_to().getId() + " - " + user.getReports_to().getFirst_name() + " " + user.getReports_to().getLast_name());

        }

        return userDetailResponse;
    }
}
