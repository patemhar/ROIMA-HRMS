package com.roima.hrms.Controller;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.ApiResponse;
import com.roima.hrms.Dtos.job.*;
import com.roima.hrms.Mapper.JobMapper;
import com.roima.hrms.Service.Interfaces.JobService;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;
    private final JobMapper jobMapper;
    private final SecurityUtil securityUtil;

    @PostMapping
    @PreAuthorize("hasAuthority('PER006')")
    public ApiResponse<JobResponseDto> createJob(@RequestBody JobRequestDto requestDto) {
        User currentUser = securityUtil.getCurrentUser();
        return ApiResponse.success(jobService.createJob(requestDto, currentUser), "Job Created Successfully!");
    }

    @DeleteMapping("/{jobId}")
    @PreAuthorize("hasAuthority('PER006')")
    public ApiResponse<Void> deleteJob(@PathVariable UUID jobId) {
        jobService.deleteJob(jobId);
        return ApiResponse.success(null, "Job deleted successfully");
    }

    @GetMapping("/active")
    public ApiResponse<List<JobResponseDto>> getAllActiveJobs() {
        return ApiResponse.success(jobService.getActiveJobs().stream().map(jobMapper::toDto).toList(), "Active jobs fetched successfully");
    }

    @GetMapping("/sharing-records")
    @PreAuthorize("hasAuthority('PER006')")
    public ApiResponse<List<JobSharingRecordResponseDto>> getJobSharingRecords() {
        return ApiResponse.success(jobService.getAllJobSharingRecords(), "Job sharing records retrieved successfully");
    }

    @GetMapping("/referrals")
    @PreAuthorize("hasAuthority('PER006')")
    public ApiResponse<List<ReferralResponseDto>> getReferrals() {
        return ApiResponse.success(jobService.getAllReferrals(), "Referrals retrieved successfully");
    }

    @PostMapping("/share")
    @PreAuthorize("hasAuthority('PER005')")
    public ApiResponse<Void> shareJob(@RequestBody ShareJobRequest request) {
        jobService.shareJob(request, securityUtil.getCurrentUser());
        return ApiResponse.success(null, "Job shared successfully");
    }

    @PostMapping(value = "/refer", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('PER005')")
    public ApiResponse<Void> referFriend(@ModelAttribute ReferralRequest request) throws java.io.IOException {
        jobService.referFriend(request, securityUtil.getCurrentUser());
        return ApiResponse.success(null, "Referral submitted successfully");
    }
}
