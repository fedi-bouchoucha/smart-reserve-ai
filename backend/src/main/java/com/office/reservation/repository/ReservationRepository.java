package com.office.reservation.repository;

import com.office.reservation.entity.Reservation;
import com.office.reservation.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);
    List<Reservation> findByDate(LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.status = :status AND r.chair IS NOT NULL ORDER BY r.date ASC")
    List<Reservation> findByStatusAndChairIsNotNull(@Param("status") ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.date >= :startDate AND r.date <= :endDate ORDER BY r.date ASC")
    List<Reservation> findByDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    long countByDateAndStatus(LocalDate date, ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.date >= :start AND r.date <= :end AND r.status = 'CONFIRMED'")
    List<Reservation> findConfirmedByUserAndWeek(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    boolean existsByUserIdAndDateAndStatus(Long userId, LocalDate date, ReservationStatus status);

    long countByUserIdAndDateBetweenAndStatus(Long userId, LocalDate startDate, LocalDate endDate, ReservationStatus status);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.chair.id = :chairId AND r.date = :date AND r.status = 'CONFIRMED' AND " +
           "((r.startTime < :endTime AND r.endTime > :startTime))")
    boolean existsOverlappingChairReservation(@Param("chairId") Long chairId, 
                                             @Param("date") LocalDate date, 
                                             @Param("startTime") LocalTime startTime, 
                                             @Param("endTime") LocalTime endTime);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.meetingRoom.id = :roomId AND r.date = :date AND r.status = 'CONFIRMED' AND " +
           "((r.startTime < :endTime AND r.endTime > :startTime))")
    boolean existsOverlappingRoomReservation(@Param("roomId") Long roomId, 
                                            @Param("date") LocalDate date, 
                                            @Param("startTime") LocalTime startTime, 
                                            @Param("endTime") LocalTime endTime);

    // Meeting room bookings for a user (where meeting_room is not null)
    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.meetingRoom IS NOT NULL AND r.status = 'CONFIRMED' ORDER BY r.date DESC")
    List<Reservation> findByUserIdAndMeetingRoomIsNotNull(@Param("userId") Long userId);

    // Desk bookings for a user (where chair is not null)
    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.chair IS NOT NULL AND r.status IN ('CONFIRMED', 'PENDING_APPROVAL', 'AUTO_ASSIGNED') ORDER BY r.date DESC")
    List<Reservation> findByUserIdAndChairIsNotNull(@Param("userId") Long userId);

    // Count desk reservations for a user in a given month
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.user.id = :userId AND r.chair IS NOT NULL AND r.date >= :start AND r.date <= :end AND r.status = :status")
    long countDeskReservationsByUserAndMonth(@Param("userId") Long userId, @Param("start") LocalDate start, @Param("end") LocalDate end, @Param("status") ReservationStatus status);

    // Check if user already has a desk reservation for a date
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.user.id = :userId AND r.date = :date AND r.status = :status AND r.chair IS NOT NULL")
    boolean existsByUserIdAndDateAndStatusAndChairIsNotNull(@Param("userId") Long userId, @Param("date") LocalDate date, @Param("status") ReservationStatus status);

    // Find distinct user IDs who have at least one desk reservation in a date range (any non-cancelled status)
    @Query("SELECT DISTINCT r.user.id FROM Reservation r WHERE r.chair IS NOT NULL AND r.date >= :start AND r.date <= :end AND r.status IN ('CONFIRMED', 'PENDING_APPROVAL', 'AUTO_ASSIGNED')")
    List<Long> findUserIdsWithDeskReservationsInRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // Check if a user already has any desk reservation (any status) for a specific date
    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.user.id = :userId AND r.date = :date AND r.chair IS NOT NULL AND r.status IN ('CONFIRMED', 'PENDING_APPROVAL', 'AUTO_ASSIGNED')")
    boolean existsDeskReservationForUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.user.id = :userId AND r.date = :date AND r.status IN ('CONFIRMED', 'PENDING_APPROVAL', 'AUTO_ASSIGNED')")
    List<Reservation> findActiveByUserIdAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
}
