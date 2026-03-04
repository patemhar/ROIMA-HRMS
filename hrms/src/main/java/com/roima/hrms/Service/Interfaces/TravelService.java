package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.dtos.Travel.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface TravelService {

    //Travel
    TravelResponseSummary createTravel(TravelRequest dto);

    TravelResponse getTravel(UUID travelId);

    Page<TravelResponseSummary> getMyTravel(Integer page, Integer size, String search);

    List<TravelResponseSummary> getTravelsForUser(UUID userId);

    Page<TravelResponseSummary> getTravels(Integer page, Integer size, String search);

    Void cancelTravel(UUID travelId);

    //Travel Member
    void updateTravel(UUID travelId, TravelUpdateRequest dto);

    void deleteMember(UUID memberID);

    TravelMemberResponse addTravelMember(UUID travelId, UUID userId);

    void deleteTravel(UUID travelId);


    //Travel booking
    TravelBookingResponse addTravelBooking(UUID travelId, TravelBookingRequest dto);

    List<TravelBookingResponse> getTravelBookings(UUID travelId, Integer page, Integer size, String search);

    void updateBooking (UUID bookingID, TravelBookingRequest request);

    void deleteBooking (UUID bookingId);


    //Travel Itinerary
    TravelItineraryResponse addTravelItinerary(UUID travelId, TravelItineraryRequest dto);

    List<TravelItineraryResponse> getTravelItineraries(UUID travelId);

    void updateItinerary (UUID itineraryId, TravelItineraryRequest request);

    // status update

    void updateTravelStatuses();
}
