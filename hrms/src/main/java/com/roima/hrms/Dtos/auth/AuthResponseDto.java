package com.roima.hrms.dtos.auth;

import com.roima.hrms.dtos.User.UserDetailResponse;
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
