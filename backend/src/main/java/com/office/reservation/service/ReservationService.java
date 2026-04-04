package com.office.reservation.service;

import com.office.reservation.dto.BulkReservationRequest;
import com.office.reservation.dto.CalendarStatusDTO;
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
import java.time.YearMonth;
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

        // Standard checks...
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Cannot reserve on weekends.");
        }
        if (reservationRepository.existsByUserIdAndDateAndStatus(userId, date, ReservationStatus.CONFIRMED)) {
            throw new RuntimeException("You already have a confirmed reservation for this date.");
        }

        // Rule 5: Capacity limit (20%)
        long totalStaff = userRepository.countByRole(Role.EMPLOYEE) + userRepository.countByRole(Role.MANAGER);
        long occupancy = reservationRepository.countByDateAndStatus(date, ReservationStatus.CONFIRMED);
        if (totalStaff > 0 && ((double)(occupancy + 1) / totalStaff) > 0.20) {
            throw new RuntimeException("Office capacity reached (20% limit).");
        }

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
        validateWeeklyLimits(userId, request.getDates(), true);

        List<ReservationResponse> responses = new ArrayList<>();
        for (LocalDate date : request.getDates()) {
            ReservationRequest req = new ReservationRequest(request.getChairId(), request.getMeetingRoomId(), date, request.getStartTime(), request.getEndTime());
            responses.add(createReservation(userId, req));
        }
        return responses;
    }

    private void validateWeeklyLimits(Long userId, List<LocalDate> targetDates, boolean isAdding) {
        // Group new dates by their week-starting Monday
        Map<LocalDate, List<LocalDate>> datesByWeek = targetDates.stream()
                .distinct()
                .collect(Collectors.groupingBy(d -> d.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))));

        for (Map.Entry<LocalDate, List<LocalDate>> entry : datesByWeek.entrySet()) {
            LocalDate weekStart = entry.getKey();
            LocalDate weekEnd = weekStart.plusDays(4);
            
            // Current confirmed reservations in the database for this week
            List<LocalDate> existingDates = reservationRepository.findConfirmedByUserAndWeek(userId, weekStart, weekEnd)
                    .stream().map(Reservation::getDate).toList();

            long finalCount;
            if (isAdding) {
                // Combine existing and new, ensuring uniqueness
                java.util.Set<LocalDate> combined = new java.util.HashSet<>(existingDates);
                combined.addAll(entry.getValue());
                finalCount = combined.size();
            } else {
                // Subtract the ones being deleted from the existing list
                finalCount = existingDates.size() - entry.getValue().size();
            }

            if (finalCount > 0 && (finalCount < 2 || finalCount > 3)) {
                String weekRange = weekStart + " to " + weekEnd;
                throw new RuntimeException("Weekly Rule Violation: You must have exactly 2 or 3 days booked PER WEEK. " +
                        "Your current selection for the week (" + weekRange + ") results in " + finalCount + " day(s). " +
                        "Please select another day or remove one to meet the 2-3 day requirement.");
            }
        }
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

    @Transactional
    public void deleteReservation(Long userId, Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        if (!res.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        
        LocalDate weekStart = res.getDate().with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(4);
        long count = reservationRepository.countByUserIdAndDateBetweenAndStatus(userId, weekStart, weekEnd, ReservationStatus.CONFIRMED);
        
        System.out.println("Delete Attempt: User " + userId + ", Week " + weekStart + " to " + weekEnd + ", Current Count: " + count);
        
        if (count < 3) {
            throw new RuntimeException("Cancellation restricted: You must have 3 booked days for this week to be allowed to cancel one (leaving you with 2). If you need to clear your whole week, contact your manager.");
        }
        
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

    public List<CalendarStatusDTO> getCalendarAvailability(int year, int month, Long resourceId, String resourceType, Long userId) {
        YearMonth ym = YearMonth.of(year, month);
        List<CalendarStatusDTO> out = new ArrayList<>();
        long totalStaff = userRepository.countByRole(Role.EMPLOYEE);
        LocalTime s = LocalTime.of(9,0), e = LocalTime.of(17,0);
        for (LocalDate d = ym.atDay(1); !d.isAfter(ym.atEndOfMonth()); d = d.plusDays(1)) {
            long occ = reservationRepository.countByDateAndStatus(d, ReservationStatus.CONFIRMED);
            double percentage = totalStaff > 0 ? (double)occ / totalStaff : 0;
            double percentageWithBooking = totalStaff > 0 ? (double)(occ+1)/totalStaff : 0;

            if (d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY) {
                out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "Office closed (weekend)", percentage)); continue;
            }
            if (reservationRepository.existsByUserIdAndDateAndStatus(userId, d, ReservationStatus.CONFIRMED)) {
                out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "You already have a booking for this day.", percentage)); continue;
            }
            if (percentageWithBooking > 0.20) {
                out.add(new CalendarStatusDTO(d, false, "CAPACITY_REACHED", "Office capacity reached (20% of employees).", percentage)); continue;
            }
            if (resourceId != null && resourceType != null) {
                boolean taken = resourceType.equalsIgnoreCase("chair")
                    ? reservationRepository.existsOverlappingChairReservation(resourceId, d, s, e)
                    : reservationRepository.existsOverlappingRoomReservation(resourceId, d, s, e);
                if (taken) {
                    out.add(new CalendarStatusDTO(d, false, "BOOKED", resourceType.equalsIgnoreCase("chair") ? "This desk is already booked." : "Meeting room already fully booked.", percentage)); continue;
                }
            }
            out.add(new CalendarStatusDTO(d, true, "AVAILABLE", "Available", percentage));
        }
        return out;
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
