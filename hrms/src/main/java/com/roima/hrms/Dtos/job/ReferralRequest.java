package com.roima.hrms.Dtos.job;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.*;
import java.util.UUID;

@Getter
@Setter
public class ReferralRequest {

    @NotNull(message = "Job ID is required")
    private UUID jobId;

    @NotBlank(message = "Friend name is required")
    @Size(min = 1, max = 100, message = "Friend name must be between 1 and 100 characters")
    private String friendName;

    @NotBlank(message = "Friend email is required")
    @Email(message = "Invalid email format")
    private String friendEmail;

    @NotBlank(message = "Note is required")
    @Size(min = 1, max = 1000, message = "Note must be between 1 and 1000 characters")
    private String note;

    @NotNull(message = "CV file is required")
    private MultipartFile cvFile;
}
