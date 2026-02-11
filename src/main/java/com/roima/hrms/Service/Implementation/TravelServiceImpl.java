package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Core.Enums.TravelStatus;
import com.roima.hrms.Infrastructure.Repositories.*;
import com.roima.hrms.Mapper.TravelMapper;
import com.roima.hrms.Service.Interfaces.TravelService;
import com.roima.hrms.Shared.Dtos.Travel.*;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TravelServiceImpl implements TravelService{

    private final TravelRepository travelRepository;
    private final TravelMapper travelMapper;
    private final UserRepository userRepository;
    private final TravelMemberRepository travelMemberRepo;
    private final TravelBookingRepository travelBookingRepository;
    private final TravelItineraryRepository travelItineraryRepository;
    private final SecurityUtil securityUtil;

    @Value("${ImageStoreUrl}")
    private String uploadDir;

    @Override
    public TravelResponseSummary createTravel(TravelRequest dto, UUID createdBy) {

        Travel travel = travelMapper.ToTravel(dto);

        var existingUser = userRepository.findById(createdBy).orElseThrow(() -> new RuntimeException("No such user found!"));

        travel.setCreatedBy(existingUser);
        travel.setStatus(TravelStatus.PLANNED);

        Set<TravelMemberResponse> memberList = addTravelMember( travel.getId(), dto.getTravelMemberIds());

        var savedTravel = travelRepository.save(travel);

        // for memory model
        existingUser.getTravel_created_by_me().add(savedTravel);

        userRepository.save(existingUser);

        var response = travelMapper.TravelToTravelResSum(savedTravel);

        response.getTravel_members().addAll(memberList);

        return response;
    }

    // convert to travel response
    @Override
    public TravelResponse getTravel(UUID travelId) {

        var currentUser = securityUtil.getCurrentUser();

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        return travelMapper.toResponse(existingTravel);
    }

    @Override
    public List<TravelResponseSummary> getAll() {

        var allTravels = travelRepository.findAll();

        return allTravels.stream().map(travelMapper::TravelToTravelResSum).toList();
    }

    @Override
    public List<TravelResponseSummary> getTravelsForUser(UUID user_id) {

        List<Travel> user_travels = travelRepository.findByCreatedById(user_id);

        return user_travels.stream().map(travelMapper::TravelToTravelResSum).toList();
    }


    @Override
    public Set<TravelMemberResponse> addTravelMember(UUID travelId, TravelMemberRequest request) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        Set<TravelMemberResponse> travelMemberResponses = new HashSet<>();

        if(request.getMember_ids().isEmpty()) return travelMemberResponses;

        request.getMember_ids().forEach(memberId -> {

            var existingUser = userRepository.findById(memberId).orElseThrow(() -> new RuntimeException("Member not found."));

            var travelMember = new TravelMember();

            travelMember.setTravel(existingTravel);
            travelMember.setUser(existingUser);

            var savedTravelMember = travelMemberRepo.save(travelMember);

            // memory model user
            existingUser.getMy_travel().add(savedTravelMember);

            // memory model travel
            existingTravel.getMembers().add(savedTravelMember);

            travelMemberResponses.add(travelMapper.toMemberResponse(savedTravelMember));
        });

        travelRepository.save(existingTravel);

        return travelMemberResponses;
    }

    @Override
    public void deleteTravel(UUID travelId) {
        travelRepository.deleteById(travelId);
    }


    @Override
    public TravelBookingResponse addTravelBooking(UUID travelId, TravelBookingRequest dto) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        var travelBooking = travelMapper.ToBooking(dto);

        travelBooking.setTravel(existingTravel);

        travelBookingRepository.save(travelBooking);

        // memory
        existingTravel.getTravel_bookings().add(travelBooking);

        travelRepository.save(existingTravel);

        return travelMapper.ToBookingResponse(travelBooking);
    }

    @Override
    public List<TravelBookingResponse> getTravelBookings(UUID travelId) {

        var travelBookings = travelBookingRepository.findByTravelId(travelId);

        var travelBookingResponse = travelBookings.stream().map(travelMapper::ToBookingResponse).toList();

        return travelBookingResponse;
    }

    @Override
    public TravelItineraryResponse addTravelItinerary(UUID travelId, TravelItineraryRequest dto) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        TravelItinerary travelItinerary = travelMapper.ToTravelItinerary(dto);

        travelItinerary.setTravel(existingTravel);

        var savedTravelItinerary = travelItineraryRepository.save(travelItinerary);

        // memory
        existingTravel.getItineraries().add(savedTravelItinerary);

        travelRepository.save(existingTravel);

        return travelMapper.ToItineraryResponse(savedTravelItinerary);
    }

    @Override
    public List<TravelItineraryResponse> getTravelItineraries(UUID travelId) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        var travelItineraries = travelItineraryRepository.FindByTravelId(travelId);

        var travelItinerariesResponse = travelItineraries.stream().map(travelMapper::ToItineraryResponse).toList();

        return travelItinerariesResponse;
    }
}
