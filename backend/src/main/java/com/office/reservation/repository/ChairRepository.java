package com.office.reservation.repository;

import com.office.reservation.entity.Chair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ChairRepository extends JpaRepository<Chair, Long> {
    @Query("SELECT c FROM Chair c JOIN FETCH c.emplacement WHERE c.id NOT IN (" +
           "SELECT r.chair.id FROM Reservation r WHERE r.date = :date AND r.status = 'CONFIRMED' AND r.chair IS NOT NULL AND " +
           "(r.startTime < :endTime AND r.endTime > :startTime)" +
           ")")
    List<Chair> findAvailableChairs(@Param("date") LocalDate date, 
                                   @Param("startTime") LocalTime startTime, 
                                   @Param("endTime") LocalTime endTime);
}
