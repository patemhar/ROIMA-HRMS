package com.roima.hrms.Shared.Dtos.Travel;

import com.roima.hrms.Core.Entities.*;
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
public class TravelResponse {

    private UUID Id;

    private String title;

    private String description;

    private LocalDate start_date;

    private LocalDate end_date;

    private String destination;

    private TravelStatus status;

    private List<TravelMemberResponse> travelMembers = new ArrayList<>();

    private List<TravelItineraryResponse> itineraries = new ArrayList<>();

    private List<TravelExpenseResponse> expenses = new ArrayList<>();

    private List<TravelBookingResponse> travel_bookings = new ArrayList<>();

    private List<TravelDocResponse> travelDocument = new ArrayList<>();

    private UUID created_by;
}
