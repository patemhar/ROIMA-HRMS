package com.roima.hrms.Service.Implementation;

import com.roima.hrms.Core.Entities.Travel;
import com.roima.hrms.Core.Entities.TravelExpense;
import com.roima.hrms.Core.Entities.User;
import com.roima.hrms.Core.Enums.ExpenseStatus;
import com.roima.hrms.Repositories.TravelExpenseRepository;
import com.roima.hrms.Repositories.TravelRepository;
import com.roima.hrms.Repositories.UserRepository;
import com.roima.hrms.Repositories.TravelMemberRepository;
import com.roima.hrms.Mapper.TravelMapper;
import com.roima.hrms.Service.Interfaces.TravelExpenseService;
import com.roima.hrms.Dtos.Travel.TravelExpenseRequest;
import com.roima.hrms.Dtos.Travel.TravelExpenseResponse;
import lombok.RequiredArgsConstructor;
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
    private final com.roima.hrms.Service.Interfaces.NotificationService notificationService;
    private final com.roima.hrms.Service.Interfaces.EmailService emailService;
    private final TravelMemberRepository travelMemberRepo;

    @Override
    public void approveExpense(UUID expenseId, String remark) {

        if (remark.trim().isEmpty()) {
            throw new RuntimeException("Approve remark is mandatory");
        }

        User currentUser = securityUtil.getCurrentUser();

        TravelExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.isActive()) {
            throw new RuntimeException("Cannot approve a deleted expense");
        }

        if (!currentUser.getRole().getName().equals("HR") || currentUser.getId().equals(expense.getPaid_by().getId())) {
            throw new RuntimeException("Access Denied");
        }

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new RuntimeException("Only submitted expenses can be approved");
        }

        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setApproved_by(currentUser);
        expense.setApproved_at(LocalDateTime.now());
        expense.setRemark(remark);

        expenseRepository.save(expense);

        User submitter = expense.getPaid_by();
        String title = "Travel Expense Approved";
        String message = "Your travel expense has been approved.";
        notificationService.createNew(submitter, currentUser, com.roima.hrms.Core.Enums.NotificationType.TRAVEL, title, message);
        if (submitter.getEmail() != null) {
            emailService.sendSimpleMail(submitter.getEmail(), title, message);
        }
    }

    @Override
    public void rejectExpense(UUID expenseId, String remark) {

        if (remark.trim().isEmpty()) {
            throw new RuntimeException("Reject remark is mandatory");
        }

        User currentUser = securityUtil.getCurrentUser();

        if (!currentUser.getRole().getName().equals("HR")) {
            throw new RuntimeException("Only HR can reject expenses");
        }

        TravelExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.isActive()) {
            throw new RuntimeException("Cannot reject a deleted expense");
        }

        if (expense.getStatus() != ExpenseStatus.SUBMITTED) {
            throw new RuntimeException("Only submitted expenses can be rejected");
        }

        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setApproved_by(currentUser);
        expense.setApproved_at(LocalDateTime.now());
        expense.setRemark(remark);

        expenseRepository.save(expense);

        User submitter = expense.getPaid_by();
        String title = "Travel Expense Rejected";
        String message = "Your travel expense has been rejected. Remark: " + remark;
        notificationService.createNew(submitter, currentUser, com.roima.hrms.Core.Enums.NotificationType.TRAVEL, title, message);
        if (submitter.getEmail() != null) {
            emailService.sendSimpleMail(submitter.getEmail(), title, message);
        }
    }

    @Override
    public List<TravelExpenseResponse> getAllExpenses(UUID travelId) {

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        List<TravelExpense> travelExpenses = travelExpenseRepository.findByTravelId(existingTravel.getId());

        List<TravelExpenseResponse> travelExpenseResponses = travelExpenses.stream().map(travelMapper::ToExpenseResponse).toList();

        return travelExpenseResponses;
    }

    @Override
    public void deleteExpense(UUID expenseId) {
        var currentUser = securityUtil.getCurrentUser();

        var expense = expenseRepository.findById(expenseId).orElseThrow(() -> new RuntimeException("Expense not found"));

        boolean allowed = currentUser.getRole().getName().equals("HR") ||
                expense.getCreatedBy().getId().equals(currentUser.getId());

        if (!allowed) {
            throw new RuntimeException("Not allowed to delete this expense");
        }

        expense.setActive(false);
        expenseRepository.save(expense);
    }

    @Override
    public void deleteTravel(UUID travelId) {
        Travel travel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("Travel not found"));
        travel.setActive(false);
        travelRepository.save(travel);
    }

    @Override
    public TravelExpenseResponse addTravelExpense(UUID travelId, TravelExpenseRequest dto) {

        var currentUser = securityUtil.getCurrentUser();

        boolean allowed = currentUser.getRole().getName().equals("HR") ||
                travelMemberRepo.existsByTravelIdAndUserId(travelId, currentUser.getId());

        if (!allowed) {
            throw new RuntimeException("Not allowed to add expenses");
        }

        var travelExpense = travelMapper.ToTravelExpense(dto);

        var existingTravel = travelRepository.findById(travelId).orElseThrow(() -> new RuntimeException("No travel found for provided id."));

        if(dto.getExpenseDate().isBefore(existingTravel.getStart_date().minusDays(2))) {
            throw new RuntimeException("Expense cant be added before 2 days of travel start date.");
        }

        var existingUser = userRepository.findById(dto.getPaid_by()).orElseThrow(() -> new RuntimeException("Member not found."));

        if(LocalDate.now().isAfter(existingTravel.getEnd_date().plusDays(10)) && !"HR".equals(existingUser.getRole().getName())) {
            throw new RuntimeException("You can't add expense after 10 days of travel ended.");
        }

        travelExpense.setStatus(ExpenseStatus.SUBMITTED);
        travelExpense.setPaid_by(existingUser);
        travelExpense.setTravel(existingTravel);
        travelExpense.setCreatedBy(currentUser);

        var savedTravelExpense = travelExpenseRepository.save(travelExpense);

        User hrUser = existingTravel.getCreatedBy();
        if (hrUser != null && !hrUser.getId().equals(currentUser.getId())) {
            String title = "New Travel Expense Submitted";
            String message = currentUser.getFirst_name() + " " + currentUser.getLast_name() +
                    " submitted a travel expense of " + dto.getAmount() + " for " + existingTravel.getTitle();
            notificationService.createNew(hrUser, currentUser, com.roima.hrms.Core.Enums.NotificationType.TRAVEL, title, message);
            emailService.sendSimpleMail(hrUser.getEmail(), title, message);
        }

        return travelMapper.ToExpenseResponse(savedTravelExpense);
    }
}
