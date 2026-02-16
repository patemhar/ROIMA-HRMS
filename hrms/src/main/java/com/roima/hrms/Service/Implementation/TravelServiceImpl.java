package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Core.Enums.TravelStatus;
import com.roima.hrms.Infrastructure.Repositories.*;
import com.roima.hrms.Mapper.TravelMapper;
import com.roima.hrms.Service.Interfaces.TravelService;
import com.roima.hrms.Shared.Dtos.Travel.*;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    private static final Logger logger = LoggerFactory.getLogger(TravelServiceImpl.class);

    @Value("${ImageStoreUrl}")
    private String uploadDir;

    @Override
    public TravelResponseSummary createTravel(TravelRequest dto) {

        User currentUser = securityUtil.getCurrentUser();
        ensureHr(currentUser);

        Travel travel = travelMapper.ToTravel(dto);
        travel.setCreatedBy(currentUser);
        travel.setStatus(TravelStatus.PLANNED);

        Travel savedTravel = travelRepository.save(travel);

        currentUser.getTravel_created_by_me().add(savedTravel);

        // add members
        if (dto.getTravelMemberIds() != null) {
            for (UUID userId : dto.getTravelMemberIds().getMember_ids()) {

                User existingUser = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                TravelMember member = new TravelMember();
                member.setTravel(savedTravel);
                member.setUser(existingUser);

                var savedTravelMember = travelMemberRepo.save(member);

                // memory
                savedTravel.getMembers().add(savedTravelMember);
                existingUser.getMy_travel().add(savedTravelMember);
            }
        }
//        System.out.println("\n\nTravel Members:" + savedTravel.getMembers().toString());

        return travelMapper.ToTravelResSum(savedTravel);
    }


    @Override
    public TravelResponse getTravel(UUID travelId) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        return travelMapper.toResponse(existingTravel);
    }

    @Override
    public List<TravelResponseSummary> getMyTravel() {

        var allTravels = travelRepository.findByMemberUserId(securityUtil.getCurrentUser().getId());

        return allTravels.stream().map(travelMapper::ToTravelResSum).toList();
    }


    @Override
    public List<TravelResponseSummary> getTravels() {

        User currentUser = securityUtil.getCurrentUser();
        String role = currentUser.getRole().getName();

        List<Travel> travels;

        if (role.equals("HR")) {

            travels = travelRepository.findAll();

        } else if (role.equals("MANAGER")) {

            travels = travelRepository.findByReportsTo(currentUser.getId());

        } else {
            travels = travelRepository.findByMemberUserId(currentUser.getId());
        }

        return travels.stream()
                .map(travelMapper::ToTravelResSum)
                .toList();
    }


    @Override
    public List<TravelResponseSummary> getTravelsForUser(UUID user_id) {

        List<Travel> user_travels = travelRepository.findByCreatedById(user_id);

        return user_travels.stream().map(travelMapper::ToTravelResSum).toList();
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

    @Override
    public TravelResponse updateTravel(UUID travelId, TravelRequest dto) {

        Travel travel = validateAccess(travelId);
        User currentUser = securityUtil.getCurrentUser();

        String role = currentUser.getRole().getName();

        if (role.equals("MANAGER")) {
            throw new RuntimeException("Manager cannot update travel");
        }

        if (role.equals("EMPLOYEE") &&
                !travel.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not allowed");
        }

        travelMapper.updateTravel(travel, dto);

        return travelMapper.toResponse(travelRepository.save(travel));
    }


    @Override
    public void deleteTravel(UUID travelId) {

        Travel travel = validateAccess(travelId);
        User currentUser = securityUtil.getCurrentUser();

        String role = currentUser.getRole().getName();

        if (role.equals("MANAGER")) {
            throw new RuntimeException("Manager cannot delete");
        }

        if (role.equals("EMPLOYEE") &&
                !travel.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Not allowed");
        }

        travelRepository.delete(travel);
    }

    private Travel validateAccess(UUID travelId) {

        User currentUser = securityUtil.getCurrentUser();
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Travel not found"));

        String role = currentUser.getRole().getName();

        if (role.equals("HR")) return travel;

        if (role.equals("EMPLOYEE") &&
                travel.getCreatedBy().getId().equals(currentUser.getId())) {
            return travel;
        }

        if (role.equals("MANAGER")) {

            List<User> team =
                    userRepository.findByReportsTo(currentUser.getId());

            boolean allowed = team.stream()
                    .anyMatch(u -> u.getId()
                            .equals(travel.getCreatedBy().getId()));

            if (allowed) return travel;
        }

        throw new RuntimeException("Access denied");
    }

    private void ensureHr(User user) {
        if (!"HR".equals(user.getRole().getName()))
            throw new RuntimeException("Only HR allowed");
    }

}
