package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.TravelDocument;
import com.roima.hrms.Dtos.Travel.TravelDocumentResponseDto;
import org.springframework.stereotype.Component;

@Component
public class TravelDocumentMapper {

    public TravelDocumentResponseDto toDto(TravelDocument doc) {

        TravelDocumentResponseDto dto = new TravelDocumentResponseDto();

        dto.setId(doc.getId());
        dto.setDocUrl(doc.getDoc_url());
        dto.setUploadedBy(doc.getUploadedBy().getFirst_name() + " " + doc.getUploadedBy().getLast_name());
        dto.setTravelId(doc.getTravel().getId());
        dto.setCreatedAt(doc.getCreated_at());

        return dto;
    }
}
