package com.roima.hrms.Core.Entities;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class ExpenseEntity extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "travel_id", nullable = false)
    private TravelEntity travel;

    @ManyToOne
    @JoinColumn(name = "paid_by", nullable = false)
    private UserEntity paidBy;

    @Enumerated(EnumType.STRING)
    private ExpenseType expense_type;

    private String title;

    private BigDecimal amount;

    private String currency;

    private LocalDate expenseDate;
}



