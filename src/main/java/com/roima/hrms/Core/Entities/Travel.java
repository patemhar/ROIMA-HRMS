package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

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
    private List<Expense> expenses;

    @OneToMany(mappedBy = "travel")
    private List<Booking> bookings;
}
