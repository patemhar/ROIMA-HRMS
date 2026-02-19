package com.roima.hrms.Dtos.job;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class ShareJobRequest {
    UUID jobId;
    List<String> recipientEmail;
}