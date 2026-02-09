package com.roima.hrms.Shared.Dtos.Auth;

import com.roima.hrms.Core.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto {

    private String token;

    private String first_name;

    private String last_name;
}
