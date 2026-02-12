package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.ExpenseDocument;
import com.roima.hrms.Core.Entities.TravelDocument;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Infrastructure.Repositories.*;
import com.roima.hrms.Service.Interfaces.CloudinaryService;
import com.roima.hrms.Service.Interfaces.ExpenseDocumentService;
import com.roima.hrms.Shared.Dtos.DocUploadResponse;
import com.roima.hrms.Shared.Dtos.Travel.ExpenseDocRequest;
import com.roima.hrms.Shared.Dtos.Travel.ExpenseDocResponse;
import com.roima.hrms.Shared.Dtos.Travel.TravelDocResponse;
import com.roima.hrms.Shared.Dtos.Travel.TravelExpenseResponse;
import com.roima.hrms.Utility.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExpenseDocumentServiceImpl implements ExpenseDocumentService {

    private final TravelExpenseRepository travelExpenseRepository;
    private final ExpenseDocumentRepository expenseDocumentRepository;
    private final TravelMemberRepository memberRepository;
    private final SecurityUtil securityUtil;
    private final TravelRepository travelRepository;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Override
    public DocUploadResponse addExpenseDocs(UUID expenseId, ExpenseDocRequest dto) {
        User user = securityUtil.getCurrentUser();

        var existingExpense = travelExpenseRepository.findById(expenseId).orElseThrow(() -> new RuntimeException("No expense found for provided id."));

        var docUploadResponse = new DocUploadResponse();

        for (var expenseDoc : dto.getExpense_docs()) {

            if (expenseDoc.isEmpty() || expenseDoc.getSize() > MAX_FILE_SIZE) {
                docUploadResponse.getFailedDocs().add(expenseDoc.getName());
                docUploadResponse.getErrors().add("File size should be under 10MB.");
                continue;
            }

            var url = cloudinaryService.uploadFile(expenseDoc, "HRMS/Travel Expense");

            if(!url.trim().equals("")) {
                docUploadResponse.getFailedDocs().add(expenseDoc.getName());
                docUploadResponse.getErrors().add("Failed to upload doc" + expenseDoc.getName());
                continue;
            }

            var expenseDocument = new ExpenseDocument();

            expenseDocument.setDoc_url(url);
            expenseDocument.setUploadedBy(user);
            expenseDocument.setTravelExpense(existingExpense);

            var savedExpenseDocument = expenseDocumentRepository.save(expenseDocument);

            user.getMy_expense_docs().add(savedExpenseDocument);
            existingExpense.getExpense_docs().add(savedExpenseDocument);

            userRepository.save(user);
            travelExpenseRepository.save(existingExpense);

            docUploadResponse.getUploadedDocs().add(expenseDoc.getName() + ": " + url);
        }

        return docUploadResponse;
    }

    @Override
    public List<ExpenseDocument> getTravelExpenseDocs(UUID expenseId) {
        return expenseDocumentRepository.FindByExpenseId(expenseId);
    }
}

