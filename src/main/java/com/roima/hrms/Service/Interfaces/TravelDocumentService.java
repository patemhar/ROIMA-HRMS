package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.TravelDocument;
import com.roima.hrms.Shared.Dtos.DocUploadResponse;
import com.roima.hrms.Shared.Dtos.Travel.TravelDocRequest;
import com.roima.hrms.Shared.Dtos.Travel.TravelDocResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface TravelDocumentService {

    DocUploadResponse addTravelDocs(UUID travelId, TravelDocRequest dto);

    List<TravelDocument> getTravelDocs(UUID travelId);

}