package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.*;
import com.roima.hrms.Dtos.job.JobRequestDto;
import com.roima.hrms.Dtos.job.JobResponseDto;
import com.roima.hrms.Dtos.job.ReferralRequest;
import com.roima.hrms.Dtos.job.ShareJobRequest;
import com.roima.hrms.Mapper.JobMapper;
import com.roima.hrms.Repositories.JobRepository;
import com.roima.hrms.Repositories.JobSharingRecordRepository;
import com.roima.hrms.Repositories.ReferralRepository;
import com.roima.hrms.Repositories.SystemConfigRepository;
import com.roima.hrms.Service.Interfaces.CloudinaryService;
import com.roima.hrms.Service.Interfaces.EmailService;
import com.roima.hrms.Service.Interfaces.JobService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final ReferralRepository referralRepository;
    private final JobSharingRecordRepository sharingRepository;
    private final SystemConfigRepository configRepository;
    private final EmailService emailService;
    private final CloudinaryService cloudinaryService;
    private final JobMapper jobMapper;

    public List<Job> getActiveJobs() {
        return jobRepository.findByIsActiveTrue();
    }

    @Override
    @Transactional
    public void deleteJob(UUID jobId) {

        var existingJob = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("No job found for the provided id."));

        existingJob.set_active(false);
    }

    @Override
    @Transactional
    public JobResponseDto createJob(JobRequestDto requestDto, User creator) {
        Job job = jobMapper.toEntity(requestDto);
        job.setCreated_by(creator);

        Job savedJob = jobRepository.save(job);
        return jobMapper.toDto(savedJob);
    }

    @Override
    @Transactional
    public void shareJob(ShareJobRequest request, User currentUser) throws RuntimeException {

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String body = String.format("Check out this job: %s \n %s", job.getTitle(), job.getDescription());

        request.getRecipientEmail().forEach(recipient ->
                emailService.sendMailWithAttachment(recipient,  body, "Job Opportunity: " + job.getTitle(), null));

        request.getRecipientEmail().forEach(recipient -> {
            JobSharingRecord record = new JobSharingRecord();
            record.setJob(job);
            record.setUser(currentUser);
            record.setEmail(recipient);
            sharingRepository.save(record);
        });
    }

    @Override
    @Transactional
    public void referFriend(ReferralRequest request, User currentUser) throws IOException {

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String cvPath = cloudinaryService.uploadFile(request.getCvFile(), "HRMS/");

        Referral referral = new Referral();
        referral.setJob(job);
        referral.setReferred_by(currentUser);
        referral.setName(request.getFriendName());
        referral.setDetails(request.getFriendEmail()+ " " + request.getNote());
        referral.setDoc_url(cvPath);
        referralRepository.save(referral);

        var defaultHr = configRepository.findByKeyName("DEFAULT_HR_EMAIL");
        String hrMail = defaultHr.get().getValue();
        if( hrMail == null) {
            hrMail = "hr@roimaint.com";
        }

        String emailSubject = String.format("New referral from %s", referral.getReferred_by().getFirst_name() + referral.getReferred_by().getLast_name());
        String emailBody = String.format("New Referral for %s by %s. Name %s, Detail: %s, CV: %s", job.getTitle(), currentUser.getFirst_name() + currentUser.getLast_name(), referral.getName(), referral.getDetails(), cvPath);

        if(job.getDefault_reviewer() != null) {
            emailService.sendSimpleMail(job.getDefault_reviewer().getEmail(), emailSubject, emailBody);
        }

        emailService.sendSimpleMail(hrMail, emailSubject, emailBody);
    }
}

