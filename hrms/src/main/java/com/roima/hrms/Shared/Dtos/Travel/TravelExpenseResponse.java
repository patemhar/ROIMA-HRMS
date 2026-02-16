package com.roima.hrms.Shared.Dtos.Travel;

import com.roima.hrms.Core.Enums.ExpenseType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Component
public class TravelExpenseResponse {

    private UUID Id;

    private UUID paid_by;

    private ExpenseType expense_type;

    private String title;

    private String description;

    private BigDecimal amount;

    private String currency;

    private LocalDate expenseDate;

    private UUID approved_by;
}
