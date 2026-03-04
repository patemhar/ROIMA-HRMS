package com.roima.hrms.dtos.Travel;


import com.roima.hrms.Core.Enums.TravelStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelResponseSummary {

    private UUID id;

    private String title;

    private String description;

    private LocalDate start_date;

    private LocalDate end_date;

    private String destination;

    private TravelStatus status;

    private String createdByName;

    private List<TravelMemberResponse> travel_members = new ArrayList<>();
}
