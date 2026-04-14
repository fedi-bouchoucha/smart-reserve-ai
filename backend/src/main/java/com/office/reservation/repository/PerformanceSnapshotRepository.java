package com.office.reservation.repository;

import com.office.reservation.entity.PerformanceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PerformanceSnapshotRepository extends JpaRepository<PerformanceSnapshot, Long> {

    List<PerformanceSnapshot> findByUserIdOrderByWeekStartDesc(Long userId);

    @Query("SELECT ps FROM PerformanceSnapshot ps WHERE ps.user.id = :userId ORDER BY ps.weekStart DESC")
    List<PerformanceSnapshot> findLatestByUserId(@Param("userId") Long userId);

    @Query("SELECT ps FROM PerformanceSnapshot ps WHERE ps.user.id = :userId AND ps.weekStart >= :startDate ORDER BY ps.weekStart ASC")
    List<PerformanceSnapshot> findByUserIdAndWeekStartAfter(@Param("userId") Long userId, @Param("startDate") LocalDate startDate);

    Optional<PerformanceSnapshot> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);

    @Query("SELECT ps FROM PerformanceSnapshot ps WHERE ps.weekStart = :weekStart")
    List<PerformanceSnapshot> findAllByWeekStart(@Param("weekStart") LocalDate weekStart);

    @Query("SELECT ps FROM PerformanceSnapshot ps WHERE ps.user.id IN :userIds AND ps.weekStart >= :startDate ORDER BY ps.weekStart ASC")
    List<PerformanceSnapshot> findByUserIdsAndWeekStartAfter(@Param("userIds") List<Long> userIds, @Param("startDate") LocalDate startDate);
}
