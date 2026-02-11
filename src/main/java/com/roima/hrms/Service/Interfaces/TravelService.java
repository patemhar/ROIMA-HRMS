package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Shared.Dtos.Travel.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;


public interface TravelService {

    //Travel
    TravelResponseSummary createTravel(TravelRequest dto, UUID createdBy);

    TravelResponse getTravel(UUID travelId);

    List<TravelResponseSummary> getAll();

    List<TravelResponseSummary> getTravelsForUser(UUID userId);


    //Travel Member
    Set<TravelMemberResponse> addTravelMember(UUID travelId, TravelMemberRequest request);

    void deleteTravel(UUID travelId);


    //Travel booking
    TravelBookingResponse addTravelBooking(UUID travelId, TravelBookingRequest dto);

    List<TravelBookingResponse> getTravelBookings(UUID travelId);


    //Travel Itinerary
    TravelItineraryResponse addTravelItinerary(UUID travelId, TravelItineraryRequest dto);

    List<TravelItineraryResponse> getTravelItineraries(UUID travelId);
}
