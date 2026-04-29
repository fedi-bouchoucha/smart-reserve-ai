package com.office.reservation.service;

import com.office.reservation.dto.*;
import com.office.reservation.entity.Reservation;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.Role;
import com.office.reservation.entity.User;
import com.office.reservation.event.ReservationStatusChangedEvent;
import com.office.reservation.exception.ReservationConflictException;
import com.office.reservation.repository.*;
import com.office.reservation.entity.HomeOffice;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChairRepository chairRepository;
    private final MeetingRoomRepository meetingRoomRepository;
    private final UserRepository userRepository;
    private final DayOffRepository dayOffRepository;
    private final HomeOfficeRepository homeOfficeRepository;
    private final ConflictResolver conflictResolver;
    private final ApplicationEventPublisher eventPublisher;

    public ReservationService(ReservationRepository reservationRepository,
                              ChairRepository chairRepository,
                              MeetingRoomRepository meetingRoomRepository,
                              UserRepository userRepository,
                              DayOffRepository dayOffRepository,
                              HomeOfficeRepository homeOfficeRepository,
                              ConflictResolver conflictResolver,
                              ApplicationEventPublisher eventPublisher) {
        this.reservationRepository = reservationRepository;
        this.chairRepository = chairRepository;
        this.meetingRoomRepository = meetingRoomRepository;
        this.userRepository = userRepository;
        this.dayOffRepository = dayOffRepository;
        this.homeOfficeRepository = homeOfficeRepository;
        this.conflictResolver = conflictResolver;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public ReservationResponse createReservation(Long userId, ReservationRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LocalDate date = request.getDate();
        LocalTime start = request.getStartTime() != null ? request.getStartTime() : LocalTime.of(9, 0);
        LocalTime end = request.getEndTime() != null ? request.getEndTime() : LocalTime.of(17, 0);

        // Past time check
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (date.isBefore(today)) {
            throw new RuntimeException("Cannot reserve a date in the past.");
        }
        if (date.isEqual(today) && start.isBefore(now)) {
            throw new RuntimeException("Cannot reserve a past time slot.");
        }

        // Weekends check
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Cannot reserve on weekends.");
        }

        // For desk (chair) reservations, check duplicate booking on same date
        if (request.getChairId() != null) {
            if (reservationRepository.existsDeskReservationForUserAndDate(userId, date)) {
                throw new RuntimeException("You already have a desk reservation (confirmed or pending) for this date.");
            }
            if (dayOffRepository.existsByUserIdAndDateAndStatus(userId, date, ReservationStatus.CONFIRMED) ||
                dayOffRepository.existsByUserIdAndDateAndStatus(userId, date, ReservationStatus.PENDING_APPROVAL)) {
                throw new RuntimeException("You cannot reserve a desk on a day you have a declared day off (pending or confirmed).");
            }

            // Custom constraints for specific desks
            String deskName = chairRepository.findById(request.getChairId())
                    .map(c -> c.getEmplacement().getName())
                    .orElse("");
            if (deskName.equals("1") && !user.getUsername().equals("employee63")) {
                throw new RuntimeException("Desk 1 can only be reserved by employee63.");
            }
            if (deskName.equals("43") && !user.getUsername().equals("employee70")) {
                throw new RuntimeException("Desk 43 can only be reserved by employee70.");
            }
            if (deskName.equals("44") && !user.getUsername().equals("employee71")) {
                throw new RuntimeException("Desk 44 can only be reserved by employee71.");
            }
        }

        ReservationStatus finalStatus = ReservationStatus.CONFIRMED;

        // Rule: 1st-20th Booking Window (Only for Desks)
        if (request.getChairId() != null) {
            YearMonth requestMonth = YearMonth.from(date);
            YearMonth currentMonth = YearMonth.from(today);
            
            if (!requestMonth.isAfter(currentMonth)) {
                throw new RuntimeException("You cannot reserve a desk for the current month. You must book in advance for a future month.");
            }
            
            // Rule: Only allow booking for the next month (applies ONLY to regular Employees)
            if (user.getRole() == Role.EMPLOYEE) {
                if (requestMonth.equals(currentMonth.plusMonths(1))) {
                    if (today.getDayOfMonth() > 20) {
                        finalStatus = ReservationStatus.PENDING_APPROVAL;
                    }
                } else {
                    throw new RuntimeException("As an employee, you can only reserve a desk for the month immediately following the current month.");
                }
            } else {
                // Admins and Managers can book any future month, but it stays pending if it's too far ahead or past the 20th
                if (requestMonth.equals(currentMonth.plusMonths(1)) && today.getDayOfMonth() > 20) {
                    finalStatus = ReservationStatus.PENDING_APPROVAL;
                } else if (requestMonth.isAfter(currentMonth.plusMonths(1))) {
                    finalStatus = ReservationStatus.PENDING_APPROVAL;
                }
            }
        }

        // Rule: If replacing a Home Office day, it MUST be approved by manager
        if (request.getChairId() != null && finalStatus == ReservationStatus.CONFIRMED) {
            if (homeOfficeRepository.existsByUserIdAndDate(userId, date)) {
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
        // Monthly attendance validation
        validateMonthlyPresence(userId, request.getDates());

        List<ReservationResponse> responses = new ArrayList<>();
        for (int i = 0; i < request.getDates().size(); i++) {
            LocalDate date = request.getDates().get(i);
            Long cId = (request.getChairIds() != null && i < request.getChairIds().size()) 
                    ? request.getChairIds().get(i) 
                    : request.getChairId();
            
            ReservationRequest req = new ReservationRequest(cId, request.getMeetingRoomId(), date, request.getStartTime(), request.getEndTime());
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
        if (targetDates == null || targetDates.isEmpty()) return;
        
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.EMPLOYEE) return;

        LocalDate firstDate = targetDates.get(0);
        YearMonth ym = YearMonth.from(firstDate);
        
        // Count working days in the target month
        int workingDays = 0;
        for (LocalDate d = ym.atDay(1); !d.isAfter(ym.atEndOfMonth()); d = d.plusDays(1)) {
            if (d.getDayOfWeek() != DayOfWeek.SATURDAY && d.getDayOfWeek() != DayOfWeek.SUNDAY) {
                workingDays++;
            }
        }

        int targetDays = (int) Math.ceil((double) workingDays * user.getTargetAttendance() / 100);
        
        // Count existing desk reservations for that month using optimized query
        long existingCount = reservationRepository.countActiveDeskReservationsByUserAndMonth(
                userId, ym.atDay(1), ym.atEndOfMonth());

        if (existingCount + targetDates.size() < targetDays) {
            throw new RuntimeException("To confirm your reservations for " + ym.getMonth() + 
                ", you must book at least " + targetDays + " days to reach your " + 
                user.getTargetAttendance() + "% monthly attendance target.");
        }
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

        // Past time check
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (request.getDate().isBefore(today)) {
            throw new RuntimeException("Cannot book a meeting room for a past date.");
        }
        if (request.getDate().isEqual(today) && start.isBefore(now)) {
            throw new RuntimeException("Cannot book a meeting room for a past time slot.");
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
        
        // If approving a desk reservation, check if we need to remove a Home Office record
        if (newStatus == ReservationStatus.CONFIRMED && res.getChair() != null) {
            homeOfficeRepository.findByUserIdAndDate(res.getUser().getId(), res.getDate())
                .ifPresent(ho -> homeOfficeRepository.delete(ho));
        }

        res.setStatus(newStatus);
        return mapToResponse(reservationRepository.save(res));
    }

    @Transactional
    public void deleteReservation(Long userId, Long reservationId) {
        Reservation res = reservationRepository.findById(reservationId).orElseThrow();
        if (!res.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");

        if (res.getStatus() == ReservationStatus.AUTO_ASSIGNED) {
            throw new RuntimeException("Auto-assigned reservations cannot be deleted by employees.");
        }

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
        return chairRepository.findAvailableChairs(date, LocalTime.of(9,0), LocalTime.of(17,0), Arrays.asList(ReservationStatus.CONFIRMED, ReservationStatus.PENDING_APPROVAL, ReservationStatus.AUTO_ASSIGNED)).stream().collect(Collectors.toList());
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
        User user = userRepository.findById(userId).orElse(null);

        // Desk assignment constraints
        if (resourceId != null && "chair".equalsIgnoreCase(resourceType)) {
            String deskName = chairRepository.findById(resourceId).map(c -> c.getEmplacement().getName()).orElse("");
            if (deskName.equals("1") && user != null && !user.getUsername().equals("employee63")) {
                for (LocalDate d = ym.atDay(1); !d.isAfter(ym.atEndOfMonth()); d = d.plusDays(1)) {
                    out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "Desk 1 can only be reserved by employee63.", 0));
                }
                return out;
            }
            if (deskName.equals("43") && user != null && !user.getUsername().equals("employee70")) {
                for (LocalDate d = ym.atDay(1); !d.isAfter(ym.atEndOfMonth()); d = d.plusDays(1)) {
                    out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "Desk 43 can only be reserved by employee70.", 0));
                }
                return out;
            }
            if (deskName.equals("44") && user != null && !user.getUsername().equals("employee71")) {
                for (LocalDate d = ym.atDay(1); !d.isAfter(ym.atEndOfMonth()); d = d.plusDays(1)) {
                    out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "Desk 44 can only be reserved by employee71.", 0));
                }
                return out;
            }
        }

        for (LocalDate d = ym.atDay(1); !d.isAfter(ym.atEndOfMonth()); d = d.plusDays(1)) {
            long occ = reservationRepository.countByDateAndStatus(d, ReservationStatus.CONFIRMED);
            double percentage = totalStaff > 0 ? (double)occ / totalStaff : 0;
            double percentageWithBooking = totalStaff > 0 ? (double)(occ+1)/totalStaff : 0;

            if (d.getDayOfWeek() == DayOfWeek.SATURDAY || d.getDayOfWeek() == DayOfWeek.SUNDAY) {
                out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "Office closed (weekend)", percentage)); continue;
            }
            if (reservationRepository.existsDeskReservationForUserAndDate(userId, d)) {
                out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "You already have a desk reservation for this day.", percentage)); continue;
            }
            if (dayOffRepository.existsByUserIdAndDateAndStatus(userId, d, ReservationStatus.CONFIRMED) ||
                dayOffRepository.existsByUserIdAndDateAndStatus(userId, d, ReservationStatus.PENDING_APPROVAL)) {
                out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "You have a day off declared (pending or confirmed) for this day.", percentage)); continue;
            }
            // 5. Next month only restriction (Employees only)
            if (user != null && user.getRole() == Role.EMPLOYEE && resourceType != null && resourceType.equalsIgnoreCase("chair")) {
                if (!YearMonth.from(d).equals(YearMonth.from(LocalDate.now()).plusMonths(1))) {
                    out.add(new CalendarStatusDTO(d, false, "RESTRICTED", "Desk reservations are only allowed for the next month.", percentage)); continue;
                }
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
