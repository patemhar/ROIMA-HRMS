package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Core.Enums.NotificationType;
import com.roima.hrms.Core.Enums.TravelStatus;
import com.roima.hrms.dtos.Travel.*;
import com.roima.hrms.Mapper.TravelMapper;
import com.roima.hrms.Repositories.*;
import com.roima.hrms.Service.Interfaces.NotificationService;
import com.roima.hrms.Service.Interfaces.EmailService;
import com.roima.hrms.Service.Interfaces.TravelService;
import com.roima.hrms.Utility.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@RequiredArgsConstructor
@Service
@Slf4j
public class TravelServiceImpl implements TravelService{

    private final TravelRepository travelRepository;
    private final TravelMapper travelMapper;
    private final UserRepository userRepository;
    private final TravelMemberRepository travelMemberRepo;
    private final TravelBookingRepository travelBookingRepository;
    private final TravelItineraryRepository travelItineraryRepository;
    private final SecurityUtil securityUtil;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Override
    public TravelResponseSummary createTravel(TravelRequest dto) {

        User currentUser = securityUtil.getCurrentUser();
        ensureHr(currentUser);

        Travel travel = travelMapper.ToTravel(dto);
        travel.setCreatedBy(currentUser);
        travel.setStatus(TravelStatus.PLANNED);

        Travel savedTravel = travelRepository.save(travel);

        return travelMapper.ToTravelResSum(savedTravel);
    }

    @Override
    public Void cancelTravel(UUID travelId) {

        Travel travel = validateAccess(travelId);

        if (travel.getStatus() == TravelStatus.CANCELLED) {
            throw new RuntimeException("Travel is already canceled");
        }

        if(travel.getStart_date().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot cancel travel that has already started or completed");
        }

        travel.setStatus(TravelStatus.CANCELLED);
        travelRepository.save(travel);

        log.info("Travel cancelled: {} by {}", travel.getTitle(), securityUtil.getCurrentUser().getEmail());

        // Notify members
        String title = "Travel Plan Canceled";
        String message = "The travel plan: " + travel.getTitle() + ", On " + travel.getStart_date() + " - " + travel.getEnd_date() + " has been canceled.";
        for (TravelMember member : travel.getMembers()) {
            User user = member.getUser();
            notificationService.createNew(user, securityUtil.getCurrentUser(), NotificationType.TRAVEL, title, message);
            emailService.sendSimpleMail(user.getEmail(), title, message);
        }

        return null;
    }

    @Override
    public TravelResponse getTravel(UUID travelId) {

        validateAccess(travelId);

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        if (!existingTravel.isActive()) {
            throw new RuntimeException("Travel has been deleted");
        }

        return travelMapper.toResponse(existingTravel);
    }

    @Override
    public Page<TravelResponseSummary> getMyTravel(Integer page, Integer size, String search) {

        User currentUser = securityUtil.getCurrentUser();

        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 10);

        Page<Travel> travels = travelRepository.findByMemberUserId(currentUser.getId(), search, pageable);

        return travels.map(travelMapper::ToTravelResSum);
    }


    @Override
    public Page<TravelResponseSummary> getTravels(Integer page, Integer size, String search) {

        User currentUser = securityUtil.getCurrentUser();
        String role = currentUser.getRole().getName();

        Pageable pageable = PageRequest.of(page != null ? page : 0, size != null ? size : 10);

        Page<Travel> travels;

        if (role.equals("HR")) {

            travels = travelRepository.findAllActive(search, pageable);

        } else if (role.equals("MANAGER")) {

            travels = travelRepository.findByReportsTo(currentUser.getId(), search, pageable);

        } else {
            travels = travelRepository.findByMemberUserId(currentUser.getId(), search, pageable);
        }

        return travels.map(travelMapper::ToTravelResSum);
    }


    @Override
    public List<TravelResponseSummary> getTravelsForUser(UUID user_id) {

        User currentUser = securityUtil.getCurrentUser();
        String role = currentUser.getRole().getName();

        if (!role.equals("HR") && !currentUser.getId().equals(user_id)) {
            throw new RuntimeException("Access denied");
        }

        List<Travel> user_travels = travelRepository.findByCreatedById(user_id);

        return user_travels.stream().map(travelMapper::ToTravelResSum).toList();
    }


    @Override
    public TravelMemberResponse addTravelMember(UUID travelId, UUID userId) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        if (existingTravel.getStart_date().isBefore(java.time.LocalDate.now()) || existingTravel.getStart_date().equals(java.time.LocalDate.now())) {
            throw new RuntimeException("Cannot add members after travel has started");
        }

        if(userId == null) {
            throw new RuntimeException("User ID is required");
        }

        User currentUser = securityUtil.getCurrentUser();
        var existingUser = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Member not found."));

        boolean alreadyExists = travelMemberRepo.existsByTravelIdAndUserId(existingTravel.getId(), existingUser.getId());
        if (alreadyExists) {
            throw new RuntimeException("User " + existingUser.getFirst_name() + " " + existingUser.getLast_name() + " is already a member of this travel");
        }

        var travelMember = new TravelMember();
        travelMember.setTravel(existingTravel);
        travelMember.setUser(existingUser);

        var savedTravelMember = travelMemberRepo.save(travelMember);

        String title = "Added to Travel Plan";
        String message = "You have been added to travel: " + existingTravel.getTitle() +
            " from " + existingTravel.getStart_date() + " to " + existingTravel.getEnd_date();
        notificationService.createNew(existingUser, currentUser, NotificationType.TRAVEL, title, message);
        emailService.sendSimpleMail(existingUser.getEmail(), title, message);

        return travelMapper.toMemberResponse(savedTravelMember);
    }

    @Override
    public TravelBookingResponse addTravelBooking(UUID travelId, TravelBookingRequest dto) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        var travelBooking = travelMapper.ToBooking(dto);

        travelBooking.setTravel(existingTravel);

        travelBookingRepository.save(travelBooking);

        return travelMapper.ToBookingResponse(travelBooking);
    }

    @Override
    public List<TravelBookingResponse> getTravelBookings(UUID travelId, Integer page, Integer size, String search) {

        var travelBookings = travelBookingRepository.findByTravelId(travelId);

        var travelBookingResponse = travelBookings.stream().map(travelMapper::ToBookingResponse).toList();

        return travelBookingResponse;
    }

    @Override
    public void updateBooking(UUID bookingID, TravelBookingRequest request) {

        var travelBooking = travelBookingRepository.findById(bookingID).orElseThrow(() -> new RuntimeException("No booking found for provided id."));

        var updatedTravelBooking = travelMapper.updateBooking(travelBooking, request);

        travelBookingRepository.save(updatedTravelBooking);
    }

    @Override
    public void deleteBooking(UUID bookingId) {
        travelBookingRepository.deleteById(bookingId);
    }

    @Override
    public TravelItineraryResponse addTravelItinerary(UUID travelId, TravelItineraryRequest dto) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        var travelStart = existingTravel.getStart_date().minusDays(1);
        var travelEnd = existingTravel.getEnd_date().plusDays(1);
        var itineraryStart = dto.getStartDateTime().toLocalDate();
        var itineraryEnd = dto.getEndDateTime().toLocalDate();

        if (itineraryStart.isBefore(travelStart) || itineraryEnd.isAfter(travelEnd)) {
            throw new RuntimeException("Itinerary dates must be within travel start -1 day to travel end +1 day");
        }

        TravelItinerary travelItinerary = travelMapper.ToTravelItinerary(dto);

        travelItinerary.setTravel(existingTravel);

        var savedTravelItinerary = travelItineraryRepository.save(travelItinerary);


        return travelMapper.ToItineraryResponse(savedTravelItinerary);
    }

    @Override
    public List<TravelItineraryResponse> getTravelItineraries(UUID travelId) {

        var travelItineraries = travelItineraryRepository.FindByTravel_Id(travelId);

        var travelItinerariesResponse = travelItineraries.stream().map(travelMapper::ToItineraryResponse).toList();

        return travelItinerariesResponse;
    }

    @Override
    public void updateItinerary(UUID itineraryId, TravelItineraryRequest request) {

        var travelItinerary = travelItineraryRepository.findById(itineraryId).orElseThrow(() -> new RuntimeException("No itinerary found for given"));

        var updatedTravelItinerary = travelMapper.updateTravelItinerary(request, travelItinerary);

        travelItineraryRepository.save(updatedTravelItinerary);
    }

    @Override
    @Transactional
    public void updateTravelStatuses() {
        try {
            travelRepository.updateStatus();
            log.info("updated travel statuses successfully");
        } catch (Exception e) {
            log.error("Error updating travel statuses: ", e);
        }
    }

    @Override
    public void updateTravel(UUID travelId, TravelUpdateRequest dto) {

        Travel travel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        var updatedTravel = travelMapper.updateTravel(travel, dto);

        travelRepository.save(updatedTravel);
    }

    @Override
    public void deleteMember(UUID memberId) {
        TravelMember member = travelMemberRepo.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Travel member not found"));

        travelMemberRepo.delete(member);
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

        travel.setActive(false);
        travelRepository.save(travel);

    }

    // helpers

    private Travel validateAccess(UUID travelId) {

        User currentUser = securityUtil.getCurrentUser();
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new RuntimeException("Travel not found"));

        if (!travel.isActive()) {
            throw new RuntimeException("Travel has been deleted");
        }

        String role = currentUser.getRole().getName();

        if (role.equals("HR")) return travel;

        boolean isMember = travel.getMembers().stream()
                .anyMatch(member -> member.getUser().getId().equals(currentUser.getId()));

        if (isMember) {
            return travel;
        }

        if (role.equals("MANAGER")) {
            boolean managesMember = travel.getMembers().stream()
                    .anyMatch(member -> member.getUser().getReports_to() != null &&
                            member.getUser().getReports_to().getId().equals(currentUser.getId()));
            if (managesMember) {
                return travel;
            }
        }

        throw new RuntimeException("Access denied");
    }

    private void ensureHr(User user) {
        if (!"HR".equals(user.getRole().getName()))
            throw new RuntimeException("Only HR allowed");
    }

}
