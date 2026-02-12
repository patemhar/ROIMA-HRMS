package com.roima.hrms.Core.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "expense_document")
public class ExpenseDocument extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @ManyToOne
    @JoinColumn(name = "expense_id")
    private TravelExpense travelExpense;

    private String doc_url;
}
