package com.roima.hrms.Mapper;

import com.roima.hrms.Core.Entities.ExpenseDocument;
import com.roima.hrms.dtos.Travel.ExpenseDocumentResponseDto;
import org.springframework.stereotype.Component;

@Component
public class ExpenseDocumentMapper {

    public ExpenseDocumentResponseDto toDto(ExpenseDocument doc) {

        ExpenseDocumentResponseDto dto = new ExpenseDocumentResponseDto();

        dto.setId(doc.getId());
        dto.setDocUrl(doc.getDoc_url());
        dto.setUploadedBy(doc.getUploadedBy().getFirst_name() + " " + doc.getUploadedBy().getLast_name());
        dto.setExpenseId(doc.getTravelExpense().getId());
        dto.setCreatedAt(doc.getCreated_at());

        return dto;
    }
}
