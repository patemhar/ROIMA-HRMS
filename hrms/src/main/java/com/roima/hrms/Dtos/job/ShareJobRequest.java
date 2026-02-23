package com.roima.hrms.Dtos.job;

import lombok.Getter;
import lombok.Setter;

import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ShareJobRequest {

    @NotNull(message = "Job ID is required")
    UUID jobId;

    @NotEmpty(message = "Recipient emails are required")
    List<String> recipientEmail;
}