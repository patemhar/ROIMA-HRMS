package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.TravelDocument;
import com.roima.hrms.Repositories.TravelDocumentRepository;
import com.roima.hrms.Repositories.TravelMemberRepository;
import com.roima.hrms.Repositories.TravelRepository;
import com.roima.hrms.Repositories.UserRepository;
import com.roima.hrms.Service.Interfaces.CloudinaryService;
import com.roima.hrms.Service.Interfaces.TravelDocumentService;
import com.roima.hrms.Dtos.DocUploadResponse;
//import com.roima.hrms.Shared.Dtos.Travel.TravelDocRequest;
//import com.roima.hrms.Shared.Dtos.Travel.TravelDocResponse;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TravelDocumentServiceImpl implements TravelDocumentService {

    private final TravelDocumentRepository travelDocumentRepository;
    private final TravelMemberRepository memberRepository;
    private final SecurityUtil securityUtil;
    private final TravelRepository travelRepository;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Override
    public DocUploadResponse addTravelDocs(UUID travelId, MultipartFile[] files) throws IOException {

        var user = securityUtil.getCurrentUser();

        boolean allowed =
                user.getRole().getName().equals("HR") ||
                        memberRepository.existsByTravelIdAndUserId(
                                travelId, user.getId());

        if (!allowed)
            throw new RuntimeException("Not allowed");

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        var docUploadResponse = new DocUploadResponse();

        for (var travelDoc : files) {

            if (travelDoc.isEmpty() || travelDoc.getSize() > MAX_FILE_SIZE) {
                docUploadResponse.getFailedDocs().add(travelDoc.getName());
                docUploadResponse.getErrors().add("File size should be under 10MB.");
                continue;
            }

            var url = cloudinaryService.uploadFile(travelDoc, "HRMS/Travel Document");

            if(url == null) {
                docUploadResponse.getFailedDocs().add(travelDoc.getName());
                docUploadResponse.getErrors().add("Failed to upload doc" + travelDoc.getName());
                continue;
            }

            TravelDocument travelDocument = new TravelDocument();

            travelDocument.setDoc_url(url);
            travelDocument.setUploadedBy(user);
            travelDocument.setTravel(existingTravel);

            var savedTravelDoc = travelDocumentRepository.save(travelDocument);

            user.getMy_travel_docs().add(savedTravelDoc);
            existingTravel.getTravel_documents().add(savedTravelDoc);

            userRepository.save(user);
            travelRepository.save(existingTravel);

            docUploadResponse.getUploadedDocs().add(travelDoc.getName() + ": " + url);
        }

        return docUploadResponse;
    }

    @Override
    public List<TravelDocument> getTravelDocs(UUID travel_id) {
        return travelDocumentRepository.findByTravelId(travel_id);
    }
}