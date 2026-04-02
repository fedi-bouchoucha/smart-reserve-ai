package com.office.reservation.service;

import com.office.reservation.dto.BulkReservationRequest;
import com.office.reservation.dto.ReservationRequest;
import com.office.reservation.dto.ReservationResponse;
import com.office.reservation.entity.Reservation;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.Role;
import com.office.reservation.entity.User;
import com.office.reservation.exception.ReservationConflictException;
import com.office.reservation.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChairRepository chairRepository;
    private final MeetingRoomRepository meetingRoomRepository;
    private final UserRepository userRepository;
    private final ConflictResolver conflictResolver;

    public ReservationService(ReservationRepository reservationRepository,
                              ChairRepository chairRepository,
                              MeetingRoomRepository meetingRoomRepository,
                              UserRepository userRepository,
                              ConflictResolver conflictResolver) {
        this.reservationRepository = reservationRepository;
        this.chairRepository = chairRepository;
        this.meetingRoomRepository = meetingRoomRepository;
        this.userRepository = userRepository;
        this.conflictResolver = conflictResolver;
    }

    @Transactional
    public ReservationResponse createReservation(Long userId, ReservationRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate date = request.getDate();
        LocalTime start = request.getStartTime() != null ? request.getStartTime() : LocalTime.of(9, 0);
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : LocalTime.of(17, 0);

        // Rule 1: Window check for Chairs (20th - 28th of current month)
        if (request.getChairId() != null) {
            int today = LocalDate.now().getDayOfMonth();
            if (today < 20 || today > 28) {
                throw new RuntimeException("Chair reservations can only be made between the 20th and 28th of the month.");
            }
        }

        // Rule 2: Weekday only
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Cannot reserve on weekends.");
        }

        // Rule 3: One resource per day for the user
        if (reservationRepository.existsByUserIdAndDateAndStatus(userId, date, ReservationStatus.CONFIRMED)) {
            throw new RuntimeException("You already have a confirmed reservation for this date.");
        }

        // Rule 4: Weekly limit (min 2, max 3)
        LocalDate weekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(4);
        long currentWeekCount = reservationRepository.countByUserIdAndDateBetweenAndStatus(userId, weekStart, weekEnd, ReservationStatus.CONFIRMED);
        
        if (currentWeekCount >= 3) {
            throw new RuntimeException("Maximum 3 reservations per week reached.");
        }

        // Rule 5: Capacity limit (20%)
        long totalStaff = userRepository.countByRole(Role.EMPLOYEE) + userRepository.countByRole(Role.MANAGER);
        long occupancy = reservationRepository.countByDateAndStatus(date, ReservationStatus.CONFIRMED);
        if (totalStaff > 0 && ((double)(occupancy + 1) / totalStaff) > 0.20) {
            throw new RuntimeException("Office capacity reached (20% limit).");
        }

        // Rule 6: WFH Rotation (Mon/Fri mandatory if WFH last week)
        LocalDate prevMonday = weekStart.minusWeeks(1);
        LocalDate prevFriday = prevMonday.plusDays(4);
        List<Reservation> prevWeekRes = reservationRepository.findConfirmedByUserAndWeek(userId, prevMonday, prevFriday);
        
        if (prevWeekRes.isEmpty()) { 
            boolean isMonOrFri = date.equals(weekStart) || date.equals(weekEnd);
            if (!isMonOrFri) {
                 boolean hasMon = reservationRepository.existsByUserIdAndDateAndStatus(userId, weekStart, ReservationStatus.CONFIRMED);
                 boolean hasFri = reservationRepository.existsByUserIdAndDateAndStatus(userId, weekEnd, ReservationStatus.CONFIRMED);
                 if (!hasMon || !hasFri) {
                     throw new RuntimeException("Mandatory Office Presence: You must reserve both Monday and Friday this week.");
                 }
            }
        }

        // Rule 7: Specific Resource Availability
        validateAvailability(request, start, end);

        Reservation res = Reservation.builder()
                .user(user)
                .chair(request.getChairId() != null ? chairRepository.findById(request.getChairId()).orElse(null) : null)
                .meetingRoom(request.getMeetingRoomId() != null ? meetingRoomRepository.findById(request.getMeetingRoomId()).orElse(null) : null)
                .date(date)
                .startTime(start)
                .endTime(end)
                .status(ReservationStatus.CONFIRMED)
                .build();

        return mapToResponse(reservationRepository.save(res));
    }

    @Transactional
    public List<ReservationResponse> createBulkReservations(Long userId, BulkReservationRequest request) {
        List<ReservationResponse> responses = new ArrayList<>();
        for (LocalDate date : request.getDates()) {
            ReservationRequest req = new ReservationRequest(request.getChairId(), request.getMeetingRoomId(), date, request.getStartTime(), request.getEndTime());
            responses.add(createReservation(userId, req));
        }
        return responses;
    }

    private void validateAvailability(ReservationRequest req, LocalTime start, LocalTime end) {
        if (req.getChairId() != null) {
            if (reservationRepository.existsOverlappingChairReservation(req.getChairId(), req.getDate(), start, end)) {
                throw new ReservationConflictException("Chair already booked.", conflictResolver.proposeAlternatives(req.getDate(), start, end));
            }
        }
        if (req.getMeetingRoomId() != null) {
            if (reservationRepository.existsOverlappingRoomReservation(req.getMeetingRoomId(), req.getDate(), start, end)) {
                throw new ReservationConflictException("Room already booked.", conflictResolver.proposeAlternatives(req.getDate(), start, end));
            }
        }
    }

    public List<ReservationResponse> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId).stream().map(this::mapToResponse).toList();
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    public void deleteReservation(Long userId, Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        if (!res.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        reservationRepository.delete(res);
    }

    public Map<String, Integer> getUserWeeklyReservationCounts(Long userId) {
        return Map.of("count", reservationRepository.findByUserId(userId).size());
    }

    public long getOccupancyCount(LocalDate date) {
        return reservationRepository.countByDateAndStatus(date, ReservationStatus.CONFIRMED);
    }

    public boolean checkMinimumOccupancy(LocalDate date) {
        long totalStaff = userRepository.countByRole(Role.EMPLOYEE) + userRepository.countByRole(Role.MANAGER);
        long occupancy = getOccupancyCount(date);
        return totalStaff > 0 && ((double)occupancy / totalStaff) >= 0.25;
    }

    public List<Object> getAvailableChairs(LocalDate date) {
        return chairRepository.findAvailableChairs(date, LocalTime.of(9,0), LocalTime.of(17,0)).stream().collect(Collectors.toList());
    }

    public List<Object> getAvailableRooms(LocalDate date) {
        return meetingRoomRepository.findAvailableRooms(date, LocalTime.of(9,0), LocalTime.of(17,0)).stream().collect(Collectors.toList());
    }

    private ReservationResponse mapToResponse(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFullName())
                .chairId(r.getChair() != null ? r.getChair().getId() : null)
                .chairInfo(r.getChair() != null ? "Chair " + r.getChair().getNumber() : null)
                .meetingRoomId(r.getMeetingRoom() != null ? r.getMeetingRoom().getId() : null)
                .meetingRoomName(r.getMeetingRoom() != null ? r.getMeetingRoom().getName() : null)
                .date(r.getDate())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .build();
    }
}
