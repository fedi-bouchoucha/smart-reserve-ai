package com.office.reservation.controller;

import com.office.reservation.dto.BulkReservationRequest;
import com.office.reservation.dto.CalendarStatusDTO;
import com.office.reservation.dto.ReservationRequest;
import com.office.reservation.dto.ReservationResponse;
import com.office.reservation.entity.User;
import com.office.reservation.exception.ReservationConflictException;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.RecommendationService;
import com.office.reservation.service.ReservationService;
import com.office.reservation.service.SmartSchedulingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;
    private final SmartSchedulingService smartSchedulingService;
    private final RecommendationService recommendationService;

    public ReservationController(ReservationService reservationService,
                                UserRepository userRepository,
                                SmartSchedulingService smartSchedulingService,
                                RecommendationService recommendationService) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
        this.smartSchedulingService = smartSchedulingService;
        this.recommendationService = recommendationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> createReservation(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestBody ReservationRequest request) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ReservationResponse response = reservationService.createReservation(user.getId(), request);
            return ResponseEntity.ok(response);
        } catch (ReservationConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "status", "conflict",
                    "error", e.getMessage(),
                    "alternatives", e.getAlternatives()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> createBulkReservations(@AuthenticationPrincipal UserDetails userDetails,
                                                    @RequestBody BulkReservationRequest request) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            List<ReservationResponse> responses = reservationService.createBulkReservations(user.getId(), request);
            return ResponseEntity.ok(responses);
        } catch (ReservationConflictException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "status", "conflict",
                    "error", e.getMessage(),
                    "alternatives", e.getAlternatives()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(reservationService.getUserReservations(user.getId()));
    }

    @GetMapping("/my/weekly-counts")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<Map<String, Integer>> getWeeklyCounts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(reservationService.getUserWeeklyReservationCounts(user.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> deleteReservation(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long id) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            reservationService.deleteReservation(user.getId(), id);
            return ResponseEntity.ok(Map.of("message", "Reservation deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/occupancy/{date}")
    public ResponseEntity<Map<String, Object>> getOccupancy(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(Map.of(
                "date", date,
                "occupancyCount", reservationService.getOccupancyCount(date),
                "meetsMinimum25Percent", reservationService.checkMinimumOccupancy(date)
        ));
    }

    @GetMapping("/available/chairs/{date}")
    public ResponseEntity<List<Object>> getAvailableChairs(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getAvailableChairs(date));
    }

    @GetMapping("/available/rooms/{date}")
    public ResponseEntity<List<Object>> getAvailableRooms(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getAvailableRooms(date));
    }

    @GetMapping("/calendar-status")
    public ResponseEntity<List<CalendarStatusDTO>> getCalendarStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam int year, @RequestParam int month,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) String resourceType) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(reservationService.getCalendarAvailability(year, month, resourceId, resourceType, user.getId()));
    }

    @GetMapping("/smart-schedule")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getSmartSchedule(@AuthenticationPrincipal UserDetails userDetails,
                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                                             @RequestParam int duration) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(smartSchedulingService.suggestSlots(user.getId(), date, duration));
    }

    @GetMapping("/recommendations")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> getRecommendations(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(recommendationService.getRecommendations(user.getId()));
    }
}
