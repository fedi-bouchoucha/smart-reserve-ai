package com.office.reservation.repository;

import com.office.reservation.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findTop50ByOrderByTimestampDesc();

    List<ActivityLog> findByStatusOrderByTimestampDesc(String status);

    List<ActivityLog> findByUserIdOrderByTimestampDesc(Long userId);

    long countByStatus(String status);

    List<ActivityLog> findByTimestampAfterOrderByTimestampDesc(LocalDateTime since);

    Optional<ActivityLog> findTopByUserIdOrderByTimestampDesc(Long userId);

    long countByRecommendedAction(String action);

    long countByTimestampAfter(LocalDateTime since);

    long countByStatusAndTimestampAfter(String status, LocalDateTime since);
}
