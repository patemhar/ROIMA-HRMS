package com.roima.hrms.dtos.profile;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ProfileAdminRequestDTO {

    private UUID userId;

    private String empNumber;
    private UUID departmentId;
    private LocalDate joinedDate;

    private String phone;
    private String bio;
    private String location;
}