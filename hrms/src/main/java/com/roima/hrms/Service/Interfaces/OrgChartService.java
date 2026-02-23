package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Dtos.User.UserDetailResponse;

import java.util.List;
import java.util.UUID;

public interface OrgChartService {

    List<UserDetailResponse> getNextLayer(UUID userId);

    UserDetailResponse getAscendingNode(UUID userId);
}
