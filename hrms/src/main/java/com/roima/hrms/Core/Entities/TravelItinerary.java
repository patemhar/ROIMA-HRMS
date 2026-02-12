package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "travel_itineraries")
public class TravelItinerary extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_id", nullable = false)
    private Travel travel;

    private String title;

    private String description;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    private String location;
}


