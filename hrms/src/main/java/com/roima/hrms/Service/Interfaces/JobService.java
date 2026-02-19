package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.Job;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Dtos.job.JobRequestDto;
import com.roima.hrms.Dtos.job.JobResponseDto;
import com.roima.hrms.Dtos.job.ReferralRequest;
import com.roima.hrms.Dtos.job.ShareJobRequest;
import jakarta.mail.MessagingException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface JobService {

    JobResponseDto createJob(JobRequestDto requestDto, User creator);

    List<Job> getActiveJobs();

    void deleteJob(UUID jobId);

    void shareJob(ShareJobRequest request, User currentUser);

    void referFriend(ReferralRequest request, User currentUser) throws IOException, MessagingException;
}
