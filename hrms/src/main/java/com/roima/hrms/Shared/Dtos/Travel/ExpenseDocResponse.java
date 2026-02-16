package com.roima.hrms.Shared.Dtos.Travel;

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
public class ExpenseDocResponse {

    private UUID id;
    private String fileUrl;
    private UUID uploadedBy;
    private LocalDateTime uploadedAt;
}
