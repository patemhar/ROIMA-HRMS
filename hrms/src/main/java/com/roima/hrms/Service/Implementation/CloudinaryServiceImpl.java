package com.roima.hrms.Service.Implementation;

import com.cloudinary.Cloudinary;
import com.roima.hrms.Service.Interfaces.CloudinaryService;
import com.roima.hrms.Utility.SecurityUtil;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    @Resource
    private Cloudinary cloudinary;
    private SecurityUtil securityUtil;

    @Override
    public String uploadFile(MultipartFile file, String folderName) {
        try{

            var currentUserId = securityUtil.getCurrentUser().getId();

            HashMap<Object, Object> options = new HashMap<>();
            options.put("folder", folderName);
            options.put("public_id", currentUserId.toString() + LocalDateTime.now());
            options.put("resource_type", "auto");
            Map uploadedFile = cloudinary.uploader().upload(file.getBytes(), options);
            String publicId = (String) uploadedFile.get("public_id");
            return cloudinary.url().secure(true).generate(publicId);

        }catch (IOException e){
            e.printStackTrace();
            return null;
        }
    }
}