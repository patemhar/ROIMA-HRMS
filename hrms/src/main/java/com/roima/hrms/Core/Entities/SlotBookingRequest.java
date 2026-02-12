package com.roima.hrms.Core.Entities;

import com.roima.hrms.Core.Enums.BookingRequestStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "booking_requests",
    uniqueConstraints = {
        @UniqueConstraint(
                columnNames = {"slot_id", "user_id"}
        )
    }
)
public class SlotBookingRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private GameSlot slot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime requested_at;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingRequestStatus status;

    private Integer priority_score = 0;
}
