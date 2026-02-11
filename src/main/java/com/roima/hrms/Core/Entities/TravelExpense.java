package com.roima.hrms.Core.Entities;

import com.roima.hrms.Core.Enums.ExpenseStatus;
import com.roima.hrms.Core.Enums.ExpenseType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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

    private String description;

    private BigDecimal amount;

    private String currency;

    private LocalDate expenseDate;

    private LocalDateTime approved_at;

    private String remark;

    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approved_by;

    @OneToMany(mappedBy = "travel_expense", fetch = FetchType.LAZY)
    private Set<ExpenseDocument> expense_docs = new HashSet<>();
}



