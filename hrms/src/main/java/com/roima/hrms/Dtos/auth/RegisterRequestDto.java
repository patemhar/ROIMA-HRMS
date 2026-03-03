package com.roima.hrms.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {

    private String first_name;

    private String last_name;

    private String email;

    private String password;

    private String confirm_password;

    private UUID role;

    private UUID reports_to;
}
