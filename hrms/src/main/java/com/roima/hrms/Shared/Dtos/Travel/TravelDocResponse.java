package com.roima.hrms.Shared.Dtos.Travel;

import com.roima.hrms.Core.Entities.Travel;
import com.roima.hrms.Core.Entities.User;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
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
public class TravelDocResponse {

    private UUID id;
    private String fileUrl;
    private UUID uploadedBy;
    private LocalDateTime uploadedAt;
}

