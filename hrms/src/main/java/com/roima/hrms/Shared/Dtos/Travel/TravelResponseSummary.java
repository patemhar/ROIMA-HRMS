package com.roima.hrms.Shared.Dtos.Travel;


import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.TravelStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
public class TravelResponseSummary {

    private UUID id;

    private String title;

    private String description;

    private LocalDate start_date;

    private LocalDate end_date;

    private String destination;

    private TravelStatus status;

    private List<TravelMemberResponse> travel_members = new ArrayList<>();
}
