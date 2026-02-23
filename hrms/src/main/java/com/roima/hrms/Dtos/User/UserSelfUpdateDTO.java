package com.roima.hrms.Dtos.User;

import lombok.Data;

@Data
public class UserSelfUpdateDTO {
    private String firstName;
    private String lastName;
    private String email;
    // password update might be separate
}
