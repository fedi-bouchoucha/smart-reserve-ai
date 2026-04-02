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
}
