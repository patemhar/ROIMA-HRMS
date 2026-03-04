package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.dtos.DocUploadResponse;
import com.roima.hrms.dtos.Travel.TravelDocumentResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface TravelDocumentService {

    DocUploadResponse addTravelDocs(UUID travelId, MultipartFile[] files) throws IOException;

    List<TravelDocumentResponseDto> getTravelDocs(UUID travelId);

    void deleteTravelDoc(UUID docId);
}