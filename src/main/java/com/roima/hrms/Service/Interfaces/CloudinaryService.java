package com.roima.hrms.Service.Interfaces;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CloudinaryService {

    public String uploadFile(MultipartFile file, String folderName);
}