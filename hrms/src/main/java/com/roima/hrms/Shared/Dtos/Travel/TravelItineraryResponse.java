package com.roima.hrms.Shared.Dtos.Travel;

import com.roima.hrms.Core.Entities.Travel;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
public class TravelItineraryResponse {

    private UUID itineraryId;

    private String title;

    private String description;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    private String location;
}
