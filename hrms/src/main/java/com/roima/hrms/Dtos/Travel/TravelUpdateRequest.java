package com.roima.hrms.Dtos.Travel;

import com.roima.hrms.Core.Entities.User;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelUpdateRequest {

    private String title;

    private String description;

    private LocalDate start_date;

    private LocalDate end_date;

    private String destination;
}
