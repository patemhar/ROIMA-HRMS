package com.roima.hrms.Core.Entities;

import com.roima.hrms.Core.Enums.ExpenseType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "travel_expenses")
public class TravelExpense extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "travel_id", nullable = false)
    private Travel travel;

    @ManyToOne
    @JoinColumn(name = "paid_by", nullable = false)
    private User paid_by;

    @Enumerated(EnumType.STRING)
    private ExpenseType expense_type;

    private String title;

    private BigDecimal amount;

    private String currency;

    private LocalDate expenseDate;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approved_by;

    @OneToMany(mappedBy = "travel_expense", fetch = FetchType.LAZY)
    private Set<ExpenseDocument> expense_docs = new HashSet<>();
}



