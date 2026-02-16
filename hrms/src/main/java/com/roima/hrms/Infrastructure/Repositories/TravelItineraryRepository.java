package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.TravelItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TravelItineraryRepository extends JpaRepository<TravelItinerary, UUID> {

    @NativeQuery("SELECT * FROM travel_itineraries JOIN travels ON travels.id = travel_itineraries.travel_id WHERE travel.id = ?1")
    List<TravelItinerary> FindByTravelId(UUID travelId);
}
