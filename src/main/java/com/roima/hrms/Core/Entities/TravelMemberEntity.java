package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

@Entity
@Table(
        name = "travel_members",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"travel_id", "user_id"})
        }
)
public class TravelMemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "travel_id", nullable = false)
    private TravelEntity travel;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

}
