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
public class TravelResponse {

    private UUID Id;

    private String title;

    private String description;

    private LocalDate start_date;

    private LocalDate end_date;

    private String destination;

    private TravelStatus status;

    private Double allowance;

    private List<TravelMemberResponse> travelMembers = new ArrayList<>();

    private List<TravelItineraryResponse> itineraries = new ArrayList<>();

    private List<TravelBookingResponse> travel_bookings = new ArrayList<>();

    private List<TravelDocumentResponseDto> travelDocument = new ArrayList<>();

    private UUID created_by;

    private String created_by_name;
}
