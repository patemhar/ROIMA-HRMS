package com.roima.hrms.dtos.Travel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelMemberResponse {

    private UUID id;

    private UUID member_id;

    private String name;

    private String role;

    private String email;
}
