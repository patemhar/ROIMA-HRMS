package com.roima.hrms.Service.Interfaces;

// Interface
public interface EmailService {

    String sendSimpleMail(String to, String subject, String body);

    String sendMailWithAttachment(String to, String body, String subject, String attachment);
}
