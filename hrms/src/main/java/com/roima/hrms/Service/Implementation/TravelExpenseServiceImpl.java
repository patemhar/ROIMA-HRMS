package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Travel;
import com.roima.hrms.Core.Entities.TravelExpense;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.ExpenseStatus;
import com.roima.hrms.Infrastructure.Repositories.TravelExpenseRepository;
import com.roima.hrms.Infrastructure.Repositories.TravelRepository;
import com.roima.hrms.Infrastructure.Repositories.UserRepository;
import com.roima.hrms.Mapper.TravelMapper;
import com.roima.hrms.Service.Interfaces.TravelExpenseService;
import com.roima.hrms.Shared.Dtos.Travel.TravelExpenseRequest;
import com.roima.hrms.Shared.Dtos.Travel.TravelExpenseResponse;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.security.SecurityUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TravelExpenseServiceImpl implements TravelExpenseService {

    private final TravelExpenseRepository expenseRepository;
    private final TravelRepository travelRepository;
    private final TravelMapper travelMapper;
    private final UserRepository userRepository;
    private final com.roima.hrms.Utility.SecurityUtil securityUtil;
    private final TravelExpenseRepository travelExpenseRepository;

    @Override
    public void approveExpense(UUID expenseId, String remark) {

        User currentUser = securityUtil.getCurrentUser();

        if (!currentUser.getRole().getName().equals("HR")) {
            throw new RuntimeException("Only HR can approve expenses");
        }

        TravelExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new RuntimeException("Only submitted expenses can be approved");
        }

        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setApproved_by(currentUser);
        expense.setApproved_at(LocalDateTime.now());
        expense.setRemark(remark);

        expenseRepository.save(expense);
    }

    @Override
    public void rejectExpense(UUID expenseId, String remark) {

        if (remark == null || remark.isBlank()) {
            throw new RuntimeException("Reject remark is mandatory");
        }

        User currentUser = securityUtil.getCurrentUser();

        if (!currentUser.getRole().getName().equals("HR")) {
            throw new RuntimeException("Only HR can reject expenses");
        }

        TravelExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new RuntimeException("Only submitted expenses can be rejected");
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setApproved_by(currentUser);
        expense.setApproved_at(LocalDateTime.now());
        expense.setRemark(remark);

        expenseRepository.save(expense);
    }

    @Override
    public void deleteTravel(UUID travelId) {
        travelRepository.deleteById(travelId);
    }

    @Override
    public TravelExpenseResponse addTravelExpense(UUID travelId, TravelExpenseRequest dto) {

        var travelExpense = travelMapper.ToTravelExpense(dto);

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        var existingUser = userRepository.findById(dto.getPaid_by()).orElseThrow(() -> new RuntimeException("Member not found."));

        if(LocalDate.now().isAfter(existingTravel.getEnd_date().plusDays(10)) && existingUser.getRole().getName() != "HR") {
            throw new RuntimeException("You can't add expense after 10 days of travel ended.");
        }

        travelExpense.setStatus(ExpenseStatus.SUBMITTED);
        travelExpense.setPaid_by(existingUser);
        travelExpense.setTravel(existingTravel);

        var savedTravelExpense = travelExpenseRepository.save(travelExpense);

        existingTravel.getExpenses().add(travelExpense);
        existingUser.getMy_travel_expenses().add(travelExpense);

        return travelMapper.ToExpenseResponse(savedTravelExpense);
    }

    @Override
    public List<TravelExpenseResponse> getAllExpenses(UUID travelId) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        List<TravelExpense> travelExpenses = travelExpenseRepository.findByTravelId(existingTravel.getId());

        List<TravelExpenseResponse> travelExpenseResponses = travelExpenses.stream().map(travelMapper::ToExpenseResponse).toList();

        return travelExpenseResponses;
    }



}
