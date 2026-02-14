package com.office.reservation.repository;

import com.office.reservation.entity.Reservation;
import com.office.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByDate(LocalDate date);

    List<Reservation> findByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);

    // Check if user already has reservation on a given date
    boolean existsByUserIdAndDateAndStatus(Long userId, LocalDate date, ReservationStatus status);

    // Check if chair is booked on date
    boolean existsByChairIdAndDateAndStatus(Long chairId, LocalDate date, ReservationStatus status);

    // Check if meeting room is booked on date
    boolean existsByMeetingRoomIdAndDateAndStatus(Long meetingRoomId, LocalDate date, ReservationStatus status);

    // Count reservations for a specific date (for min 25% rule)
    long countByDateAndStatus(LocalDate date, ReservationStatus status);

    // Count reservations for a user between dates (for 50% weekly rule)
    long countByUserIdAndDateBetweenAndStatus(Long userId, LocalDate start, LocalDate end, ReservationStatus status);

    // Get user's reservation on specific date
    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.date = :date AND r.status = 'CONFIRMED'")
    List<Reservation> findConfirmedByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    // Get all confirmed reservations for a date
    @Query("SELECT r FROM Reservation r WHERE r.date = :date AND r.status = 'CONFIRMED'")
    List<Reservation> findConfirmedByDate(@Param("date") LocalDate date);

    // Get user's reservations for a week
    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.date BETWEEN :start AND :end AND r.status = 'CONFIRMED'")
    List<Reservation> findConfirmedByUserAndWeek(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
