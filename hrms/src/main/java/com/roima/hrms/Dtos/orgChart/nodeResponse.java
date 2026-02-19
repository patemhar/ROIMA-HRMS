package com.roima.hrms.Dtos.orgChart;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class nodeResponse {

    @NotNull
    private UUID id;

    private String first_name;

    private String last_name;

    private String email;

    private String role;

    private String reports_to;
}
