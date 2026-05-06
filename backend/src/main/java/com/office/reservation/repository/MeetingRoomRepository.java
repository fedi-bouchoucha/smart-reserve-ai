package com.office.reservation.repository;

import com.office.reservation.entity.MeetingRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface MeetingRoomRepository extends JpaRepository<MeetingRoom, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT m FROM MeetingRoom m WHERE m.id = :id")
    Optional<MeetingRoom> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT m FROM MeetingRoom m WHERE m.id NOT IN (" +
           "SELECT r.meetingRoom.id FROM Reservation r WHERE r.date = :date AND r.status = 'CONFIRMED' AND r.meetingRoom IS NOT NULL AND " +
           "(r.startTime < :endTime AND r.endTime > :startTime)" +
           ")")
    List<MeetingRoom> findAvailableRooms(@Param("date") LocalDate date, 
                                        @Param("startTime") LocalTime startTime, 
                                        @Param("endTime") LocalTime endTime);

    java.util.Optional<MeetingRoom> findByName(String name);
}
