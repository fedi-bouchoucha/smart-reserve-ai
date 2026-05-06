package com.office.reservation.repository;

import com.office.reservation.entity.Chair;
import com.office.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ChairRepository extends JpaRepository<Chair, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Chair c WHERE c.id = :id")
    Optional<Chair> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT c FROM Chair c JOIN FETCH c.emplacement WHERE c.id NOT IN (" +
           "SELECT r.chair.id FROM Reservation r WHERE r.date = :date AND r.status IN :excludedStatuses AND r.chair IS NOT NULL AND " +
           "(r.startTime < :endTime AND r.endTime > :startTime)" +
           ")")
    List<Chair> findAvailableChairs(@Param("date") LocalDate date, 
                                   @Param("startTime") LocalTime startTime, 
                                   @Param("endTime") LocalTime endTime,
                                   @Param("excludedStatuses") List<ReservationStatus> excludedStatuses);

    List<Chair> findByEmplacementId(Long emplacementId);
}
