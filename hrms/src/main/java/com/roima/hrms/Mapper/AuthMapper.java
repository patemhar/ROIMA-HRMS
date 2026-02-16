package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Service.Interfaces.AuthService;
import com.roima.hrms.Shared.Dtos.Auth.AuthResponseDto;
import com.roima.hrms.Shared.Dtos.Auth.RegisterRequestDto;
import com.roima.hrms.Shared.Dtos.Auth.RegisterResponseDto;
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

    public AuthResponseDto toAuthRes(User user) {
        return modelMapper.map(user, AuthResponseDto.class);
    }

}
