package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.Core.Entities.ExpenseDocument;
import com.roima.hrms.Dtos.DocUploadResponse;
//import com.roima.hrms.Shared.Dtos.Travel.ExpenseDocRequest;
//import com.roima.hrms.Shared.Dtos.Travel.ExpenseDocResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface ExpenseDocumentService {

    DocUploadResponse addExpenseDocs(UUID expenseId, MultipartFile[] files) throws IOException;

    List<ExpenseDocument> getTravelExpenseDocs(UUID travelId);
}
