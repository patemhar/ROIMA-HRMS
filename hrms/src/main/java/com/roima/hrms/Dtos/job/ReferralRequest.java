package com.roima.hrms.Dtos.job;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Getter
@Setter
public class ReferralRequest {
    private UUID jobId;
    private String friendName;
    private String friendEmail;
    private String note;
    private MultipartFile cvFile;
}
