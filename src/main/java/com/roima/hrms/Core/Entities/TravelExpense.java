package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

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
}



