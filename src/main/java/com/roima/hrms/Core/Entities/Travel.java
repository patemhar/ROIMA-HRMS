package com.roima.hrms.Core.Entities;

import com.roima.hrms.Core.Enums.TravelStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "travels")
public class Travel extends BaseEntity {

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    private LocalDate start_date;

    private LocalDate end_date;

    private String destination;

    @Enumerated(EnumType.STRING)
    private TravelStatus status;

    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL)
    private Set<TravelMember> members = new HashSet<>();

    @OneToMany(mappedBy = "travel")
    private Set<TravelItinerary> itineraries = new HashSet<>();

    @OneToMany(mappedBy = "travel")
    private Set<TravelExpense> expenses = new HashSet<>();

    @OneToMany(mappedBy = "travel")
    private Set<TravelBooking> travel_bookings = new HashSet<>();

    @OneToMany(mappedBy = "travel", fetch = FetchType.LAZY)
    private Set<TravelDocument> travel_documents = new HashSet<>();
}
