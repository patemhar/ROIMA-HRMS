package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Shared.Dtos.Travel.TravelExpenseRequest;
import com.roima.hrms.Shared.Dtos.Travel.TravelExpenseResponse;

import java.util.List;
import java.util.UUID;

public interface TravelExpenseService {

    void approveExpense(UUID expenseId, String remark);

    void rejectExpense(UUID expenseId, String remark);

    TravelExpenseResponse addTravelExpense(UUID travelId, TravelExpenseRequest dto);

    List<TravelExpenseResponse> getAllExpenses(UUID travelId);

    void deleteTravel(UUID travelId);
}


