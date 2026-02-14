package com.office.reservation.service;

import com.office.reservation.dto.ReservationRequest;
import com.office.reservation.dto.ReservationResponse;
import com.office.reservation.entity.*;
import com.office.reservation.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ChairRepository chairRepository;
    private final MeetingRoomRepository meetingRoomRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository,
            ChairRepository chairRepository,
            MeetingRoomRepository meetingRoomRepository,
            UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.chairRepository = chairRepository;
        this.meetingRoomRepository = meetingRoomRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReservationResponse createReservation(Long userId, ReservationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate date = request.getDate();

        // Rule 1: Reservation only between day 20-28
        int dayOfMonth = LocalDate.now().getDayOfMonth();
        if (dayOfMonth < 20 || dayOfMonth > 28) {
            throw new RuntimeException("Reservations can only be made between the 20th and 28th of the month");
        }

        // Validate reservation date is a weekday
        if (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new RuntimeException("Cannot reserve on weekends");
        }

        // Rule 2: One resource per day
        boolean hasExisting = reservationRepository.existsByUserIdAndDateAndStatus(
                userId, date, ReservationStatus.CONFIRMED);
        if (hasExisting) {
            throw new RuntimeException("You already have a reservation for this date");
        }

        // Rule 3: Chair uniqueness per day
        if (request.getChairId() != null) {
            boolean chairTaken = reservationRepository.existsByChairIdAndDateAndStatus(
                    request.getChairId(), date, ReservationStatus.CONFIRMED);
            if (chairTaken) {
                throw new RuntimeException("This chair is already reserved for this date");
            }
        }

        // Meeting room uniqueness per day
        if (request.getMeetingRoomId() != null) {
            boolean roomTaken = reservationRepository.existsByMeetingRoomIdAndDateAndStatus(
                    request.getMeetingRoomId(), date, ReservationStatus.CONFIRMED);
            if (roomTaken) {
                throw new RuntimeException("This meeting room is already reserved for this date");
            }
        }

        // Must pick either chair or meeting room
        if (request.getChairId() == null && request.getMeetingRoomId() == null) {
            throw new RuntimeException("Must select either a chair or a meeting room");
        }
        if (request.getChairId() != null && request.getMeetingRoomId() != null) {
            throw new RuntimeException("Cannot reserve both a chair and a meeting room on the same day");
        }

        // Rule 6: Cannot reserve same weekday as previous week
        LocalDate prevWeekStart = date.minusWeeks(1).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate prevWeekEnd = prevWeekStart.plusDays(4);
        List<Reservation> prevWeekReservations = reservationRepository
                .findConfirmedByUserAndWeek(userId, prevWeekStart, prevWeekEnd);
        for (Reservation r : prevWeekReservations) {
            if (r.getDate().getDayOfWeek() == date.getDayOfWeek()) {
                throw new RuntimeException("Cannot reserve the same weekday (" + date.getDayOfWeek() +
                        ") as the previous week");
            }
        }

        // Rule 5: Must be present at least 50% of working days per week (>=3/5)
        LocalDate weekStart = date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate weekEnd = weekStart.plusDays(4);
        long weekReservations = reservationRepository
                .countByUserIdAndDateBetweenAndStatus(userId, weekStart, weekEnd, ReservationStatus.CONFIRMED);
        // Adding 1 for the new reservation being created
        // No enforcement here - we check they CAN add more. The 50% rule means they
        // need >= 3 days
        // We only block if they try to cancel below 3 (handled in modification)

        // Build reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setDate(date);
        reservation.setStatus(ReservationStatus.CONFIRMED);

        if (request.getChairId() != null) {
            Chair chair = chairRepository.findById(request.getChairId())
                    .orElseThrow(() -> new RuntimeException("Chair not found"));
            reservation.setChair(chair);
        }
        if (request.getMeetingRoomId() != null) {
            MeetingRoom room = meetingRoomRepository.findById(request.getMeetingRoomId())
                    .orElseThrow(() -> new RuntimeException("Meeting room not found"));
            reservation.setMeetingRoom(room);
        }

        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    public List<ReservationResponse> getUserReservations(Long userId) {
        return reservationRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReservationResponse> getReservationsByDate(LocalDate date) {
        return reservationRepository.findConfirmedByDate(date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Rule 4: Check minimum 25% occupancy for a date
    public boolean checkMinimumOccupancy(LocalDate date) {
        long totalEmployees = userRepository.countByRole(Role.EMPLOYEE) + userRepository.countByRole(Role.MANAGER);
        long reservations = reservationRepository.countByDateAndStatus(date, ReservationStatus.CONFIRMED);
        double minRequired = totalEmployees * 0.25;
        return reservations >= minRequired;
    }

    // Get occupancy stats for a date
    public long getOccupancyCount(LocalDate date) {
        return reservationRepository.countByDateAndStatus(date, ReservationStatus.CONFIRMED);
    }

    // Available chairs for a date
    public List<Object> getAvailableChairs(LocalDate date) {
        return chairRepository.findAvailableChairsByDate(date).stream()
                .map(c -> {
                    var map = new java.util.HashMap<String, Object>();
                    map.put("id", c.getId());
                    map.put("number", c.getNumber());
                    map.put("emplacementId", c.getEmplacement().getId());
                    map.put("emplacementName", c.getEmplacement().getName());
                    map.put("floor", c.getEmplacement().getFloor());
                    return (Object) map;
                })
                .collect(Collectors.toList());
    }

    // Available meeting rooms for a date
    public List<Object> getAvailableRooms(LocalDate date) {
        return meetingRoomRepository.findAvailableRoomsByDate(date).stream()
                .map(r -> {
                    var map = new java.util.HashMap<String, Object>();
                    map.put("id", r.getId());
                    map.put("name", r.getName());
                    map.put("capacity", r.getCapacity());
                    map.put("floor", r.getFloor());
                    return (Object) map;
                })
                .collect(Collectors.toList());
    }

    private ReservationResponse mapToResponse(Reservation r) {
        return ReservationResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFullName())
                .chairId(r.getChair() != null ? r.getChair().getId() : null)
                .chairInfo(r.getChair() != null
                        ? r.getChair().getEmplacement().getName() + " - Chair " + r.getChair().getNumber()
                        : null)
                .meetingRoomId(r.getMeetingRoom() != null ? r.getMeetingRoom().getId() : null)
                .meetingRoomName(r.getMeetingRoom() != null ? r.getMeetingRoom().getName() : null)
                .date(r.getDate())
                .status(r.getStatus().name())
                .build();
    }
}
