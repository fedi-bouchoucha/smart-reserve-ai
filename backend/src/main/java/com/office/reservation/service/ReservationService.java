package com.office.reservation.service;

import com.office.reservation.dto.*;
import com.office.reservation.entity.Reservation;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.Role;
import com.office.reservation.entity.User;
import com.office.reservation.event.ReservationStatusChangedEvent;
import com.office.reservation.exception.ReservationConflictException;
import com.office.reservation.repository.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
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
    private final ApplicationEventPublisher eventPublisher;

    public ReservationService(ReservationRepository reservationRepository,
                              ChairRepository chairRepository,
                              MeetingRoomRepository meetingRoomRepository,
                              UserRepository userRepository,
                              ConflictResolver conflictResolver,
                              ApplicationEventPublisher eventPublisher) {
        this.reservationRepository = reservationRepository;
        this.chairRepository = chairRepository;
        this.meetingRoomRepository = meetingRoomRepository;
        this.userRepository = userRepository;
        this.conflictResolver = conflictResolver;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ReservationResponse createReservation(Long userId, ReservationRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate date = request.getDate();
        LocalTime start = request.getStartTime() != null ? request.getStartTime() : LocalTime.of(9, 0);
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : LocalTime.of(17, 0);

        // Weekends check
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Cannot reserve on weekends.");
        }

        // For desk (chair) reservations, check duplicate booking on same date
        if (request.getChairId() != null) {
            if (reservationRepository.existsByUserIdAndDateAndStatusAndChairIsNotNull(userId, date, ReservationStatus.CONFIRMED)) {
                throw new RuntimeException("You already have a confirmed desk reservation for this date.");
            }
        }

        ReservationStatus finalStatus = ReservationStatus.CONFIRMED;

        // Rule: 1st-20th Booking Window (Only for Desks)
        if (request.getChairId() != null) {
            LocalDate today = LocalDate.now();
            YearMonth requestMonth = YearMonth.from(date);
            YearMonth currentMonth = YearMonth.from(today);
            
            if (!requestMonth.isAfter(currentMonth)) {
                throw new RuntimeException("You cannot reserve a desk for the current month. You must book in advance for a future month.");
            }
            
            // If booking for next month, confirm only if today is <= 20
            if (requestMonth.equals(currentMonth.plusMonths(1))) {
                if (today.getDayOfMonth() > 20) {
                    finalStatus = ReservationStatus.PENDING_APPROVAL;
                }
            } else {
                // Booking for 2+ months in advance is automatically pending manager approval
                finalStatus = ReservationStatus.PENDING_APPROVAL;
            }
        }

        validateAvailability(request, start, end);

        Reservation res = Reservation.builder()
                .user(user)
                .chair(request.getChairId() != null ? chairRepository.findById(request.getChairId()).orElse(null) : null)
                .meetingRoom(request.getMeetingRoomId() != null ? meetingRoomRepository.findById(request.getMeetingRoomId()).orElse(null) : null)
                .date(date)
                .startTime(start)
                .endTime(end)
                .status(finalStatus)
                .build();

        return mapToResponse(reservationRepository.save(res));
    }

    @Transactional
    public List<ReservationResponse> createBulkReservations(Long userId, BulkReservationRequest request) {
        // Monthly 50% desk presence validation (only for desk reservations)
        if (request.getChairId() != null) {
            validateMonthlyPresence(userId, request.getDates());
        }

        List<ReservationResponse> responses = new ArrayList<>();
        for (LocalDate date : request.getDates()) {
            ReservationRequest req = new ReservationRequest(request.getChairId(), request.getMeetingRoomId(), date, request.getStartTime(), request.getEndTime());
            responses.add(createReservation(userId, req));
        }
        return responses;
    }

    /**
     * Monthly presence validation for desk bookings.
     * The 50% monthly rule is enforced by the DayOffService (days-off system).
     * Desk bookings themselves don't block — the constraint is on days off count.
     */
    private void validateMonthlyPresence(Long userId, List<LocalDate> targetDates) {
        // The 50% rule is enforced via the days-off calendar.
        // Desk booking itself has no monthly limit — only per-date availability checks apply.
    }

    /**
     * Create a meeting room booking with NO conditions — only check room availability.
     * This is completely independent of desk reservations.
     */
    @Transactional
    public ReservationResponse createMeetingRoomBooking(Long userId, MeetingRoomBookingRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalTime start = request.getStartTime() != null ? request.getStartTime() : LocalTime.of(9, 0);
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : LocalTime.of(17, 0);

        if (request.getMeetingRoomId() == null) {
            throw new RuntimeException("Meeting room must be specified.");
        }

        // Only check: is the room available at this time?
        if (reservationRepository.existsOverlappingRoomReservation(request.getMeetingRoomId(), request.getDate(), start, end)) {
            throw new RuntimeException("This meeting room is already booked for the selected time slot.");
        }

        Reservation res = Reservation.builder()
                .user(user)
                .chair(null)
                .meetingRoom(meetingRoomRepository.findById(request.getMeetingRoomId())
                        .orElseThrow(() -> new RuntimeException("Meeting room not found")))
                .date(request.getDate())
                .startTime(start)
                .endTime(end)
                .status(ReservationStatus.CONFIRMED)
                .build();

        return mapToResponse(reservationRepository.save(res));
    }

    /**
     * Get meeting room bookings for a specific user.
     */
    public List<ReservationResponse> getUserMeetingRoomBookings(Long userId) {
        return reservationRepository.findByUserIdAndMeetingRoomIsNotNull(userId)
                .stream().map(this::mapToResponse).toList();
    }

    /**
     * Get desk reservations for a specific user.
     */
    public List<ReservationResponse> getUserDeskReservations(Long userId) {
        return reservationRepository.findByUserIdAndChairIsNotNull(userId)
                .stream().map(this::mapToResponse).toList();
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

    public List<ReservationResponse> getPendingApprovalsForManager(Long managerId) {
        return reservationRepository.findByStatusAndChairIsNotNull(ReservationStatus.PENDING_APPROVAL)
                .stream()
                .filter(r -> r.getUser().getManager() != null && r.getUser().getManager().getId().equals(managerId))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ReservationResponse updatePendingReservationStatus(Long id, ReservationStatus newStatus) {
        Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        res.setStatus(newStatus);
        return mapToResponse(reservationRepository.save(res));
    }

    @Transactional
    public void deleteReservation(Long userId, Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        if (!res.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");

        reservationRepository.delete(res);

        // Notify user about cancellation
        eventPublisher.publishEvent(new ReservationStatusChangedEvent(
            this, 
            res.getUser(), 
            res.getId(), 
            res.getChair() != null ? "Chair " + res.getChair().getNumber() : "Room " + res.getMeetingRoom().getName(), 
            res.getDate(), 
            "CANCELLED", 
            "User cancelled the reservation"
        ));
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

    /**
     * Get all rooms (for meeting room booking — shows all rooms regardless of availability).
     */
    public List<Object> getAllRooms() {
        return meetingRoomRepository.findAll().stream().map(r -> (Object) Map.of(
                "id", r.getId(),
                "name", r.getName(),
                "capacity", r.getCapacity() != null ? r.getCapacity() : 0,
                "floor", r.getFloor() != null ? r.getFloor() : 0
        )).collect(Collectors.toList());
    }

    /**
     * Check if a specific room is available at a given date/time.
     */
    public boolean isRoomAvailable(Long roomId, LocalDate date, LocalTime start, LocalTime end) {
        return !reservationRepository.existsOverlappingRoomReservation(roomId, date, start, end);
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
