package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.dtos.Travel.*;
import com.roima.hrms.dtos.admin.TravelManagementDto;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class TravelMapper {

    private final ModelMapper modelMapper;

    private final TravelDocumentMapper travelDocumentMapper;

    public TravelResponseSummary ToTravelResSum (Travel travel) {

        var travelResponseSummary = new TravelResponseSummary();

        travelResponseSummary.setId(travel.getId());
        travelResponseSummary.setTitle(travel.getTitle());
        travelResponseSummary.setDescription(travel.getDescription());
        travelResponseSummary.setStart_date(travel.getStart_date());
        travelResponseSummary.setEnd_date(travel.getEnd_date());
        travelResponseSummary.setDestination(travel.getDestination());
        travelResponseSummary.setStatus(travel.getStatus());

        travelResponseSummary.setCreatedByName(travel.getCreatedBy().getFirst_name() + " " + travel.getCreatedBy().getLast_name());

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


    public TravelManagementDto convertToTravelManagementDto(com.roima.hrms.Core.Entities.Travel travel) {

        TravelManagementDto dto = new TravelManagementDto();

        dto.setId(travel.getId());
        dto.setTitle(travel.getTitle());
        dto.setDescription(travel.getDescription());
        dto.setDestination(travel.getDestination());
        dto.setStartDate(travel.getStart_date());
        dto.setEndDate(travel.getEnd_date());
        dto.setStatus(travel.getStatus());
        dto.setActive(travel.isActive());
        dto.setCreatedAt(travel.getCreated_at());
        dto.setUpdatedAt(travel.getUpdated_at());

        if (travel.getCreatedBy() != null) {
            dto.setCreatedById(travel.getCreatedBy().getId());
            dto.setCreatedByName(travel.getCreatedBy().getFirst_name() + " " + travel.getCreatedBy().getLast_name());
        }

        dto.setMemberCount(travel.getMembers() != null ? travel.getMembers().size() : 0);
        dto.setItineraryCount(travel.getItineraries() != null ? travel.getItineraries().size() : 0);
        dto.setExpenseCount(travel.getExpenses() != null ? travel.getExpenses().size() : 0);
        dto.setBookingCount(travel.getTravel_bookings() != null ? travel.getTravel_bookings().size() : 0);

        return dto;
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
        response.setAllowance(travel.getAllowance());

        if (travel.getCreatedBy() != null) {
            response.setCreated_by(travel.getCreatedBy().getId());
            response.setCreated_by_name(travel.getCreatedBy().getFirst_name() + " " + travel.getCreatedBy().getLast_name());
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

        // DOCUMENTS
        if (travel.getTravel_documents() != null) {
            response.setTravelDocument(
                    travel.getTravel_documents()
                            .stream()
                            .map(travelDocumentMapper::toDto)
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

    public Travel updateTravel (Travel travel, TravelUpdateRequest request) {

        if(request.getTitle() != null && request.getTitle().trim() != "") {
            travel.setTitle(request.getTitle());
        }
        if(request.getDescription() != null && request.getDescription().trim() != "") {
            travel.setDescription(request.getDescription());
        }
        if(request.getStart_date() != null) {
            travel.setStart_date(request.getStart_date());
        }
        if(request.getEnd_date() != null) {
            travel.setEnd_date(request.getEnd_date());
        }
        if(request.getDestination() != null && request.getDestination().trim() != "") {
            travel.setDestination(request.getDestination());
        }
        if (request.getAllowance()!= null && request.getAllowance() > 0) {
            travel.setAllowance(request.getAllowance());
        }

        return travel;
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

    public TravelItinerary updateTravelItinerary (TravelItineraryRequest request, TravelItinerary travelItinerary) {

        if(request.getTitle() != null) {
            travelItinerary.setTitle(request.getTitle());
        }
        if(request.getDescription() != null) {
            travelItinerary.setDescription(request.getDescription());
        }
        if(request.getLocation() != null) {
            travelItinerary.setLocation(request.getLocation());
        }
        if(request.getStartDateTime() != null) {
            travelItinerary.setStartDateTime(request.getStartDateTime());
        }
        if(request.getEndDateTime() != null) {
            travelItinerary.setEndDateTime(request.getEndDateTime());
        }

        return travelItinerary;
    }

    // Travel Expense

    public TravelExpense ToTravelExpense (TravelExpenseRequest travelExpenseRequest) {
        return modelMapper.map(travelExpenseRequest, TravelExpense.class);
    }

    public TravelExpenseResponse ToExpenseResponse (TravelExpense travelExpense) {

        var travelExpenseResponse = new TravelExpenseResponse();

        travelExpenseResponse.setId(travelExpense.getId());
        travelExpenseResponse.setPaid_by(travelExpense.getPaid_by().getId() + " - " + travelExpense.getPaid_by().getFirst_name() + " " + travelExpense.getPaid_by().getLast_name());
        travelExpenseResponse.setExpense_type(travelExpense.getExpense_type());
        travelExpenseResponse.setTitle(travelExpense.getTitle());
        travelExpenseResponse.setDescription(travelExpense.getDescription());
        travelExpenseResponse.setAmount(travelExpense.getAmount());
        travelExpenseResponse.setCurrency(travelExpense.getCurrency());
        travelExpenseResponse.setExpenseDate(travelExpense.getExpenseDate());
        if(travelExpense.getApproved_by() != null ) {
            travelExpenseResponse.setApproved_by(travelExpense.getApproved_by().getId() + " - " + travelExpense.getApproved_by().getFirst_name() + " " + travelExpense.getApproved_by().getLast_name());
        }
        travelExpenseResponse.setRemark(travelExpense.getRemark());
        travelExpenseResponse.setStatus(travelExpense.getStatus());

        if(travelExpense.getCreatedBy() != null) {
            travelExpenseResponse.setCreatedBy(travelExpense.getCreatedBy().getId() + " - " + travelExpense.getCreatedBy().getFirst_name() + " " + travelExpense.getCreatedBy().getLast_name());
        }

        return travelExpenseResponse;
    }


    // booking mapping

    public TravelBooking ToBooking (TravelBookingRequest travelBookingRequest) {
        return modelMapper.map(travelBookingRequest, TravelBooking.class);
    }

    public TravelBookingResponse ToBookingResponse (TravelBooking travelBooking) {

        var travelBookingResponse = new TravelBookingResponse();

        travelBookingResponse.setBooking_id(travelBooking.getId());
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

    public TravelBooking updateBooking (TravelBooking travelBooking, TravelBookingRequest request) {

        if (request.getAmount() != null) {
            travelBooking.setAmount(request.getAmount());
        }
        if (request.getBookingType() != null) {
            travelBooking.setBookingType(request.getBookingType());
        }
        if (request.getBooking_reference() != null) {
            travelBooking.setBooking_reference(request.getBooking_reference());
        }
        if (request.getCurrency() != null) {
            travelBooking.setCurrency(request.getCurrency());
        }
        if (request.getProvider_name() != null) {
            travelBooking.setProvider_name(request.getProvider_name());
        }
        if (request.getStart_dateTime() != null) {
            travelBooking.setStart_dateTime(request.getStart_dateTime());
        }
        if (request.getEnd_dateTime() != null) {
            travelBooking.setEnd_dateTime(request.getEnd_dateTime());
        }

        return travelBooking;
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
