package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.ExpenseDocument;
import com.roima.hrms.Shared.Dtos.DocUploadResponse;
import com.roima.hrms.Shared.Dtos.Travel.ExpenseDocRequest;
import com.roima.hrms.Shared.Dtos.Travel.ExpenseDocResponse;

import java.util.List;
import java.util.UUID;

public interface ExpenseDocumentService {

    DocUploadResponse addExpenseDocs(UUID expenseId, ExpenseDocRequest request);

    List<ExpenseDocument> getTravelExpenseDocs(UUID travelId);
}
