package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.TravelDocument;
import com.roima.hrms.Repositories.TravelDocumentRepository;
import com.roima.hrms.Repositories.TravelMemberRepository;
import com.roima.hrms.Repositories.TravelRepository;
import com.roima.hrms.Repositories.UserRepository;
import com.roima.hrms.Service.Interfaces.CloudinaryService;
import com.roima.hrms.Service.Interfaces.TravelDocumentService;
import com.roima.hrms.dtos.DocUploadResponse;
import com.roima.hrms.dtos.Travel.TravelDocumentResponseDto;
import com.roima.hrms.Mapper.TravelDocumentMapper;
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
    private final TravelDocumentMapper travelDocumentMapper;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Override
    public DocUploadResponse addTravelDocs(UUID travelId, MultipartFile[] files) throws IOException {

        var user = securityUtil.getCurrentUser();

        boolean allowed = user.getRole().getName().equals("HR") ||
                memberRepository.existsByTravelIdAndUserId(travelId, user.getId());

        if (!allowed) {
            throw new RuntimeException("Not allowed to upload travel documents");
        }

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

            existingTravel.getTravel_documents().add(savedTravelDoc);

            travelRepository.save(existingTravel);

            docUploadResponse.getUploadedDocs().add(travelDoc.getName() + ": " + url);
        }

        return docUploadResponse;
    }

    @Override
    public List<TravelDocumentResponseDto> getTravelDocs(UUID travel_id) {
        List<TravelDocument> docs = travelDocumentRepository.findByTravelId(travel_id);
        return docs.stream().map(travelDocumentMapper::toDto).toList();
    }

    @Override
    public void deleteTravelDoc(UUID docId) {
        var user = securityUtil.getCurrentUser();
        var doc = travelDocumentRepository.findById(docId).orElseThrow(() -> new RuntimeException("Document not found"));
        boolean allowed = user.getRole().getName().equals("HR") ||
                user.getId().equals(doc.getUploadedBy().getId());
        if (!allowed) {
            throw new RuntimeException("Not allowed to delete travel documents");
        }
        travelDocumentRepository.deleteById(docId);
    }
}