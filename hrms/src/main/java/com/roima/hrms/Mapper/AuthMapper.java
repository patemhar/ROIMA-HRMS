package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.dtos.auth.AuthResponseDto;
import com.roima.hrms.dtos.auth.RegisterRequestDto;
import com.roima.hrms.dtos.auth.RegisterResponseDto;
import com.roima.hrms.dtos.User.UserDetailResponse;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    private ModelMapper modelMapper;

    public AuthMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public User ToEntity(RegisterRequestDto registerRequestDto) {

        User user = new User();

        user.setFirst_name(registerRequestDto.getFirst_name());
        user.setLast_name(registerRequestDto.getLast_name());
        user.setEmail(registerRequestDto.getEmail());

        return user;
    }

    public RegisterResponseDto toRegRes(User user) {

        var registerResponse = new RegisterResponseDto();

        registerResponse.setId(user.getId());
        registerResponse.setName(user.getFirst_name() + user.getLast_name());
        registerResponse.setEmail(user.getEmail());
        registerResponse.setRole(user.getRole().getName());
        if(user.getReports_to() != null) {
            registerResponse.setReports_to(user.getReports_to().getFirst_name() + user.getReports_to().getFirst_name());
        }
        return registerResponse;
    }

    public AuthResponseDto toAuthRes(User user, String accessToken) {

        var authResponseDto = new AuthResponseDto();

        authResponseDto.setAccessToken(accessToken);

        var userDetailResponse = new UserDetailResponse();

        userDetailResponse.setId(user.getId());
        userDetailResponse.setFirst_name(user.getFirst_name());
        userDetailResponse.setLast_name(user.getLast_name());
        userDetailResponse.setEmail(user.getEmail());
        userDetailResponse.setRole(user.getRole().getName());
        userDetailResponse.setIs_active(user.isActive());
        userDetailResponse.setLast_login(user.getLast_login());

        user.getRole().getRolePermissions().forEach(rolePermission -> userDetailResponse.getPermission().add(rolePermission.getPermission().getCode()));

        if(user.getReports_to() != null) {

            userDetailResponse.setReports_to(user.getReports_to().getId() + " - " + user.getReports_to().getFirst_name() + " " + user.getReports_to().getLast_name());

        }

        authResponseDto.setUserDetailResponse(userDetailResponse);

        return authResponseDto;
    }

}
