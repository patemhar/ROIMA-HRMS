package com.roima.hrms.Dtos.auth;

import com.roima.hrms.Dtos.User.UserDetailResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponseDto {

    private String accessToken;

    private UserDetailResponse userDetailResponse;
}
