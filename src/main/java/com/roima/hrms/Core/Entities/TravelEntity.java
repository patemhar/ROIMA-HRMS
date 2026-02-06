package com.roima.hrms.Core.Entities;

import com.roima.hrms.Core.Entities.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "travels")
public class TravelEntity extends BaseEntity {

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private UserEntity createdBy;

    private LocalDate start_date;

    private LocalDate end_date;

    private String destination;

    @Enumerated(EnumType.STRING)
    private TravelStatus status;

    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL)
    private List<TravelMemberEntity> members;

    @OneToMany(mappedBy = "travel")
    private List<TravelItineraryEntity> itineraries;

    @OneToMany(mappedBy = "travel")
    private List<ExpenseEntity> expenses;

    @OneToMany(mappedBy = "travel")
    private List<BookingEntity> bookings;
}
