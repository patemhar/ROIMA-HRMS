package com.roima.hrms.Service.Interfaces;

import org.springframework.mail.SimpleMailMessage;

// Interface
public interface EmailService {

    String sendSimpleMail(String to, String subject, String body);

    String sendMailWithAttachment(String to, String body, String subject, String attachment);
}
