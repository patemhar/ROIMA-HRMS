package com.roima.hrms.Dtos.Travel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.time.LocalDate;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelRequest {

    private String title;

    private String description;

    private LocalDate start_date;

    private LocalDate end_date;

    private String destination;

    private TravelMemberRequest travelMemberIds;
}
