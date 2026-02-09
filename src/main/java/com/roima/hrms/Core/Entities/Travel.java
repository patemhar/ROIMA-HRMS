package com.roima.hrms.Core.Entities;

import com.roima.hrms.Core.Enums.TravelStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private List<TravelMember> members;

    @OneToMany(mappedBy = "travel")
    private List<TravelItinerary> itineraries;

    @OneToMany(mappedBy = "travel")
    private List<TravelExpense> expenses;

    @OneToMany(mappedBy = "travel")
    private List<TravelBooking> travel_bookings;

    @OneToMany(mappedBy = "travel", fetch = FetchType.LAZY)
    private Set<TravelDocument> travel_documents = new HashSet<>();
}
