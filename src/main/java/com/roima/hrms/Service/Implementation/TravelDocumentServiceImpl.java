package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Infrastructure.Repositories.TravelDocumentRepository;
import com.roima.hrms.Infrastructure.Repositories.TravelMemberRepository;
import com.roima.hrms.Infrastructure.Repositories.TravelRepository;
import com.roima.hrms.Service.Interfaces.TravelDocumentService;
import com.roima.hrms.Shared.Dtos.Travel.TravelDocRequest;
import com.roima.hrms.Shared.Dtos.Travel.TravelDocResponse;
import com.roima.hrms.Utility.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TravelDocumentServiceImpl implements TravelDocumentService {

    private final TravelDocumentRepository documentRepository;
    private final TravelMemberRepository memberRepository;
    private final SecurityUtil securityUtil;
    private final TravelRepository travelRepository;

    @Override
    public List<TravelDocResponse> addTravelDocs(UUID travelId, TravelDocRequest dto) {

        User user = securityUtil.getCurrentUser();

        boolean allowed =
                user.getRole().getName().equals("HR") ||
                        memberRepository.existsByTravelIdAndUserId(
                                travelId, user.getId());

        if (!allowed)
            throw new RuntimeException("Not allowed");

        var travelDocResponses = new ArrayList<TravelDocResponse>();

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        dto.getTravel_docs().forEach(travelDoc -> {

        });

        return null;
    }

    @Override
    public List<TravelDocResponse> getTravelDocs(UUID travel_id) {
        return List.of();
    }
}