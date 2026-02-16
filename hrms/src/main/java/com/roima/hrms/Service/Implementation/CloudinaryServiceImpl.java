package com.roima.hrms.Service.Implementation;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.roima.hrms.Service.Interfaces.CloudinaryService;
import com.roima.hrms.Utility.SecurityUtil;
import jakarta.annotation.Resource;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    @Resource
    private Cloudinary cloudinary;

    private final SecurityUtil securityUtil;

    @Override
    public String uploadFile(MultipartFile file, String folderName) throws IOException {

            var currentUserId = securityUtil.getCurrentUser().getId();

            File tempFile = Files.createTempFile(null, null).toFile();
            file.transferTo(tempFile);

            try {

//                HashMap<Object, Object> options = new HashMap<>();
//                options.put("folder", folderName);
//                options.put("public_id", currentUserId.toString() + LocalDateTime.now());
//                options.put("resource_type", "auto");

                Map uploadResult = cloudinary.uploader().upload(tempFile, ObjectUtils.emptyMap());

                System.out.println(uploadResult);

                if (!tempFile.delete()) {
                    System.err.println("Warning: Failed to delete temporary file " + tempFile.getAbsolutePath());
                }

                return (String) uploadResult.get("secure_url");

            } catch (IOException e) {

                if (!tempFile.delete()) {
                    System.err.println("Warning: Failed to delete temporary file " + tempFile.getAbsolutePath());
                }

                throw new IOException("Failed to upload file to Cloudinary", e);
            }
    }
}