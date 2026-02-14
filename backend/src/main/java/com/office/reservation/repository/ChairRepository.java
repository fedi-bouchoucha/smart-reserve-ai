package com.office.reservation.repository;

import com.office.reservation.entity.Chair;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ChairRepository extends JpaRepository<Chair, Long> {
    List<Chair> findByEmplacementId(Long emplacementId);

    @Query("SELECT c FROM Chair c WHERE c.id NOT IN " +
           "(SELECT r.chair.id FROM Reservation r WHERE r.date = :date AND r.status = 'CONFIRMED' AND r.chair IS NOT NULL)")
    List<Chair> findAvailableChairsByDate(@Param("date") LocalDate date);
}
