package com.roima.hrms.Shared.Dtos.Travel;

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
@Component
public class TravelMemberResponse {

    private UUID id;

    private UUID member_id;

    private String name;

    private String role;

    private String email;
}
