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

    public User RegReqToEntity(RegisterRequestDto registerRequestDto) {
        return modelMapper.map(registerRequestDto, User.class);
    }

    public RegisterResponseDto toRegRes(User user) {
        return modelMapper.map(user, RegisterResponseDto.class);
    }

    public AuthResponseDto toAuthRes(User user) {
        return modelMapper.map(user, AuthResponseDto.class);
    }

}
