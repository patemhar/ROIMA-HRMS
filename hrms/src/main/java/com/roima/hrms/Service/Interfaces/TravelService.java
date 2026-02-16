package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Dtos.Travel.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface TravelService {

    //Travel
    TravelResponseSummary createTravel(TravelRequest dto);

    TravelResponse getTravel(UUID travelId);

    List<TravelResponseSummary> getMyTravel();

    List<TravelResponseSummary> getTravelsForUser(UUID userId);

    List<TravelResponseSummary> getTravels();

    void updateTravel(UUID travelId, TravelUpdateRequest dto);

    void deleteMember(UUID memberID);

    //Travel Member
    Set<TravelMemberResponse> addTravelMember(UUID travelId, TravelMemberRequest request);

    void deleteTravel(UUID travelId);


    //Travel booking
    TravelBookingResponse addTravelBooking(UUID travelId, TravelBookingRequest dto);

    List<TravelBookingResponse> getTravelBookings(UUID travelId);

    void updateBooking (UUID bookingID, TravelBookingRequest request);

    void deleteBooking (UUID bookingId);


    //Travel Itinerary
    TravelItineraryResponse addTravelItinerary(UUID travelId, TravelItineraryRequest dto);

    List<TravelItineraryResponse> getTravelItineraries(UUID travelId);

    void updateItinerary (UUID itineraryId, TravelItineraryRequest request);
}
