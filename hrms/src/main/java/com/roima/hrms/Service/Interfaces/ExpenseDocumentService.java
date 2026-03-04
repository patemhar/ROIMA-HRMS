package com.roima.hrms.Service.Interfaces;

import com.roima.hrms.dtos.DocUploadResponse;
import com.roima.hrms.dtos.Travel.ExpenseDocumentResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface ExpenseDocumentService {

    DocUploadResponse addExpenseDocs(UUID expenseId, MultipartFile[] files) throws IOException;

    List<ExpenseDocumentResponseDto> getTravelExpenseDocs(UUID travelId);

    void deleteExpenseDoc(UUID docId);
}
