package com.roima.hrms.Repositories;

import com.roima.hrms.Core.Entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Modifying
    @Transactional
    @Query("""
        UPDATE Notification n
        SET n.isRead = true
        WHERE n.id = :notificationId
    """)
    void markAsRead(@Param("notificationId") UUID notificationId);

    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :userId AND n.isRead = false ORDER BY n.created_at DESC")
    List<Notification> findUnreadByUserId(@Param("userId") UUID userId);

    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :userId ORDER BY n.created_at DESC")
    List<Notification> findAllByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(n) > 0 FROM Notification n WHERE n.recipient.id = :userId AND n.notification_type = :notificationType AND n.created_at >= :startOfDay AND n.created_at < :endOfDay")
    boolean existsCelebrationNotificationToday(@Param("userId") UUID userId, @Param("notificationType") com.roima.hrms.Core.Enums.NotificationType notificationType, @Param("startOfDay") LocalDateTime startOfDay, @Param("endOfDay") LocalDateTime endOfDay);
}
