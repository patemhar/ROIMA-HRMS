package com.roima.hrms.dtos.Travel;

import com.roima.hrms.Core.Enums.ExpenseStatus;
import com.roima.hrms.Core.Enums.ExpenseType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TravelExpenseResponse {

    private UUID Id;

    private String paid_by;

    private ExpenseType expense_type;

    private String title;

    private String description;

    private BigDecimal amount;

    private String currency;

    private LocalDate expenseDate;

    private String approved_by;

    private String remark;

    private ExpenseStatus status;

    private String createdBy;
}
