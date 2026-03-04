package com.roima.hrms.dtos.Travel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExpenseDocResponse {

    private UUID id;
    private String fileUrl;
    private UUID uploadedBy;
    private LocalDateTime uploadedAt;
}
