package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.TravelExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.NativeQuery;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface TravelExpenseRepository extends JpaRepository<TravelExpense, UUID> {
    @Query("SELECT te FROM TravelExpense te WHERE te.travel.id = :travelId AND te.active = true")
    List<TravelExpense> findByTravelId(UUID travelId);

    @Query("SELECT te FROM TravelExpense te WHERE te.createdBy.id = :userId AND te.active = true")
    List<TravelExpense> findByCreatedById(UUID userId);

    @NativeQuery("SELECT expense_type, currency, SUM(amount) from travel_expenses WHERE is_active = 1 GROUP BY expense_type, currency")
    BigDecimal sumByTravelId(UUID travelId);
}
