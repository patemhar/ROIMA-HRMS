package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Shared.Dtos.Travel.*;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class TravelMapper {

    private final ModelMapper modelMapper;

    public TravelResponseSummary ToTravelResSum (Travel travel) {

        var travelResponseSummary = new TravelResponseSummary();

        travelResponseSummary.setId(travel.getId());
        travelResponseSummary.setTitle(travel.getTitle());
        travelResponseSummary.setDescription(travel.getDescription());
        travelResponseSummary.setStart_date(travel.getStart_date());
        travelResponseSummary.setEnd_date(travel.getEnd_date());
        travelResponseSummary.setDestination(travel.getDestination());
        travelResponseSummary.setStatus(travel.getStatus());

        var travelMembers = travel.getMembers();

        for(var travelMember : travelMembers) {

            var travelMemberResponse = getTravelMemberResponse(travelMember);

            travelResponseSummary.getTravel_members().add(travelMemberResponse);
        }

        return travelResponseSummary;
    }

    private static @NonNull TravelMemberResponse getTravelMemberResponse(TravelMember travelMember) {
        var travelMemberResponse = new TravelMemberResponse();

        travelMemberResponse.setId(travelMember.getId());
        travelMemberResponse.setMember_id(travelMember.getUser().getId());
        travelMemberResponse.setName(travelMember.getUser().getFirst_name() + travelMember.getUser().getLast_name());
        travelMemberResponse.setEmail(travelMember.getUser().getEmail());
        travelMemberResponse.setRole(travelMember.getUser().getRole().getName());

        return travelMemberResponse;
    }

    // Travel

    public Travel ToTravel (TravelRequest travelRequest) {
        return modelMapper.map(travelRequest, Travel.class);
    }


    public TravelResponse toResponse(Travel travel) {

        if (travel == null) return null;

        TravelResponse response = new TravelResponse();

        response.setId(travel.getId());
        response.setTitle(travel.getTitle());
        response.setDescription(travel.getDescription());
        response.setDestination(travel.getDestination());
        response.setStart_date(travel.getStart_date());
        response.setEnd_date(travel.getEnd_date());
        response.setStatus(travel.getStatus());

        if (travel.getCreatedBy() != null) {
            response.setCreated_by(travel.getCreatedBy().getId());
        }

        // MEMBERS
        if (travel.getMembers() != null) {
            response.setTravelMembers(
                    travel.getMembers()
                            .stream()
                            .map(this::toMemberResponse)
                            .toList()
            );
        }

        // ITINERARY
        if (travel.getItineraries() != null) {
            response.setItineraries(
                    travel.getItineraries()
                            .stream()
                            .map(this::ToItineraryResponse)
                            .toList()
            );
        }

        // EXPENSES
        if (travel.getExpenses() != null) {
            response.setExpenses(
                    travel.getExpenses()
                            .stream()
                            .map(this::ToExpenseResponse)
                            .toList()
            );
        }

        // DOCUMENTS
        if (travel.getTravel_documents() != null) {
            response.setTravelDocument(
                    travel.getTravel_documents()
                            .stream()
                            .map(this::toDocumentResponse)
                            .toList()
            );
        }

        // BOOKINGS
        if (travel.getTravel_bookings() != null) {
            response.setTravel_bookings(
                    travel.getTravel_bookings()
                            .stream()
                            .map(this::ToBookingResponse)
                            .toList()
            );
        }

        return response;
    }

    public Travel updateTravel (Travel travel, TravelRequest request) {
        return modelMapper.map(request, Travel.class);
    }

    // Travel Member

    public TravelMemberResponse toMemberResponse (TravelMember member) {

        TravelMemberResponse response = new TravelMemberResponse();

        response.setId(member.getId());

        if (member.getUser() != null) {
            response.setMember_id(member.getUser().getId());
            response.setName(
                    member.getUser().getFirst_name() + " " + member.getUser().getLast_name()
            );
            response.setEmail(member.getUser().getEmail());
        }

        response.setRole(member.getUser().getRole().getName());

        return response;
    }

    public TravelMember ToTravelMember (TravelMember travelMember) {
        return modelMapper.map(travelMember, TravelMember.class);
    }


    // Travel Itinerary

    public TravelItineraryResponse ToItineraryResponse(
            TravelItinerary itinerary) {

        TravelItineraryResponse response =
                new TravelItineraryResponse();

        response.setItineraryId(itinerary.getId());
        response.setStartDateTime(itinerary.getStartDateTime());
        response.setEndDateTime(itinerary.getEndDateTime());
        response.setLocation(itinerary.getLocation());
        response.setTitle(itinerary.getTitle());
        response.setDescription(itinerary.getDescription());

        return response;
    }

    public TravelItinerary ToTravelItinerary (TravelItineraryRequest travelItineraryRequest) {
        return modelMapper.map(travelItineraryRequest, TravelItinerary.class);
    }


    // Travel Expense

    public TravelExpense ToTravelExpense (TravelExpenseRequest travelExpenseRequest) {
        return modelMapper.map(travelExpenseRequest, TravelExpense.class);
    }

    public TravelExpenseResponse ToExpenseResponse (TravelExpense travelExpense) {

        var travelExpenseResponse = new TravelExpenseResponse();

        travelExpenseResponse.setPaid_by(travelExpense.getPaid_by().getId());
        travelExpenseResponse.setExpense_type(travelExpense.getExpense_type());
        travelExpenseResponse.setExpenseDate(travelExpense.getExpenseDate());
        travelExpenseResponse.setAmount(travelExpense.getAmount());
        travelExpenseResponse.setCurrency(travelExpense.getCurrency());
        travelExpenseResponse.setTitle(travelExpense.getTitle());
        travelExpenseResponse.setDescription(travelExpense.getDescription());
        travelExpenseResponse.setApproved_by(travelExpense.getApproved_by().getId());

        return travelExpenseResponse;
    }


    // booking mapping

    public TravelBooking ToBooking (TravelBookingRequest travelBookingRequest) {
        return modelMapper.map(travelBookingRequest, TravelBooking.class);
    }

    public TravelBookingResponse ToBookingResponse (TravelBooking travelBooking) {

        var travelBookingResponse = new TravelBookingResponse();

        travelBookingResponse.setTravel_id(travelBooking.getTravel().getId());
        travelBookingResponse.setBooking_reference(travelBooking.getBooking_reference());
        travelBookingResponse.setBookingType(travelBooking.getBookingType());
        travelBookingResponse.setCurrency(travelBooking.getCurrency());
        travelBookingResponse.setAmount(travelBooking.getAmount());
        travelBookingResponse.setStart_dateTime(travelBooking.getStart_dateTime());
        travelBookingResponse.setEnd_dateTime(travelBooking.getEnd_dateTime());
        travelBookingResponse.setProvider_name(travelBooking.getProvider_name());

        return travelBookingResponse;
    }

    // document res

    public TravelDocResponse toDocumentResponse(
            TravelDocument document) {

        TravelDocResponse response = new TravelDocResponse();

        response.setId(document.getId());
        response.setFileUrl(document.getDoc_url());
        response.setUploadedAt(document.getCreated_at());

        if (document.getUploadedBy() != null) {
            response.setUploadedBy(
                    document.getUploadedBy().getId());
        }

        return response;
    }


}
