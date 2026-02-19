package com.roima.hrms.Controller;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.job.JobRequestDto;
import com.roima.hrms.Dtos.job.JobResponseDto;
import com.roima.hrms.Dtos.job.JobResponseDto;
import com.roima.hrms.Dtos.job.ReferralRequest;
import com.roima.hrms.Dtos.job.ShareJobRequest;
import com.roima.hrms.Mapper.JobMapper;
import com.roima.hrms.Service.Interfaces.JobService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;
    private final JobMapper jobMapper;
    private SecurityUtil securityUtil;

    public JobController(SecurityUtil securityUtil, JobService jobService, JobMapper jobMapper) {
        this.securityUtil = securityUtil;
        this.jobService = jobService;
        this.jobMapper = jobMapper;
    }

    @PostMapping
    public ApiResponse<JobResponseDto> createJob(@RequestBody JobRequestDto requestDto) {

        User currentUser = securityUtil.getCurrentUser();

        JobResponseDto response = jobService.createJob(requestDto, currentUser);
        return ApiResponse.success(response, "Job Created Successfully!");
    }

    @DeleteMapping("/{jobId}")
    public ApiResponse<Void> deleteJob(
            @PathVariable UUID jobId
    ) {
        jobService.deleteJob(jobId);
        return ApiResponse.success(null, "Job deleted successfully");
    }

    @GetMapping("/active")
    public ResponseEntity<List<JobResponseDto>> getAllActiveJobs() {
        return ResponseEntity.ok(jobService.getActiveJobs().stream()
                .map(jobMapper::toDto).toList());
    }

    @PostMapping("/share")
    public ResponseEntity<String> shareJob(@RequestBody ShareJobRequest request) {
        var user = securityUtil.getCurrentUser();
        try {
            jobService.shareJob(request, user);
            return ResponseEntity.ok("Job shared successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping(value = "/refer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> referFriend(@ModelAttribute ReferralRequest request) {
        var user = securityUtil.getCurrentUser();
        try {
            jobService.referFriend(request, user);
            return ResponseEntity.ok("Referral submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to submit referral");
        }
    }
}
