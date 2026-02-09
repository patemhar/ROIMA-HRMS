package com.roima.hrms.Shared.Dtos.Auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDto {

    public String first_name;

    public String last_name;

    public String email;

    public String password;

    public UUID role;

    public UUID reports_to;
}
