package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.TravelItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TravelItineraryRepository extends JpaRepository<TravelItinerary, UUID> {

    @Query("SELECT ti FROM TravelItinerary ti JOIN ti.travel t WHERE t.id = ?1")
    List<TravelItinerary> FindByTravel_Id(UUID travelId);
}
