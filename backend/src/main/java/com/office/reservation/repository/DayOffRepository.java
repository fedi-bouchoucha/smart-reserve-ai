package com.office.reservation.repository;

import com.office.reservation.entity.DayOff;
import com.office.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DayOffRepository extends JpaRepository<DayOff, Long> {
    List<DayOff> findByUserId(Long userId);

    List<DayOff> findByUserIdAndDateBetweenAndStatus(Long userId, LocalDate start, LocalDate end, ReservationStatus status);

    boolean existsByUserIdAndDateAndStatus(Long userId, LocalDate date, ReservationStatus status);

    long countByUserIdAndDateBetweenAndStatus(Long userId, LocalDate start, LocalDate end, ReservationStatus status);

    Optional<DayOff> findByUserIdAndDate(Long userId, LocalDate date);
}
