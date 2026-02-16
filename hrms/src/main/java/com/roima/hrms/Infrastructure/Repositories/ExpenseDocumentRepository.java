package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.ExpenseDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.lang.annotation.Native;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseDocumentRepository extends JpaRepository<ExpenseDocument, UUID> {

    @NativeQuery("SELECT * FROM expense_document where expense_id = ?1")
    List<ExpenseDocument> FindByExpenseId(UUID expenseId);
}
