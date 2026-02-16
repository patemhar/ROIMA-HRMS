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
public class TravelExpenseRequest {

    private UUID paid_by;

    private ExpenseType expense_type;

    private String title;

    private BigDecimal amount;

    private String currency;

    private LocalDate expenseDate;

}
