package com.roima.hrms.Dtos.User;

import lombok.Data;

import java.util.UUID;

@Data
public class UserAdminUpdateDTO {
    private String firstName;
    private String lastName;
    private String email;
    private UUID roleId;
    private UUID reportsToId;
    private Boolean isActive;
}
