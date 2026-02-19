package com.roima.hrms.Dtos.profile;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ProfileResponseDTO {

    private UUID id;
    private UUID userId;

    private String empNumber;
    private String phone;
    private String bio;
    private String location;
    private String avatarUrl;

    private LocalDate joinedDate;

    private UUID departmentId;
    private String departmentName;

    private List<String> gameInterests;
}
