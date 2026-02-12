package com.roima.hrms.Infrastructure.Repositories;

import com.roima.hrms.Core.Entities.Travel;
import com.roima.hrms.Core.Entities.TravelExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TravelExpenseRepository extends JpaRepository<TravelExpense, UUID> {
    List<TravelExpense> findByTravelId(UUID travelId);

    List<TravelExpense> findByCreatedById(UUID userId);

    @NativeQuery("SELECT expense_type, currency, SUM(amount) from travel_expenses GROUP BY expense_type, currency")
    BigDecimal sumByTravelId(UUID travelId);
}
