package com.office.reservation.controller;

import com.office.reservation.dto.ReservationRequest;
import com.office.reservation.dto.ReservationResponse;
import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.ReservationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
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

    public ReservationController(ReservationService reservationService,
            UserRepository userRepository) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ReservationRequest request) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ReservationResponse response = reservationService.createReservation(user.getId(), request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(reservationService.getUserReservations(user.getId()));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ReservationResponse>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getReservationsByDate(date));
    }

    @GetMapping("/available/chairs/{date}")
    public ResponseEntity<List<Object>> getAvailableChairs(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getAvailableChairs(date));
    }

    @GetMapping("/available/rooms/{date}")
    public ResponseEntity<List<Object>> getAvailableRooms(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getAvailableRooms(date));
    }

    @GetMapping("/occupancy/{date}")
    public ResponseEntity<Map<String, Object>> getOccupancy(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        long count = reservationService.getOccupancyCount(date);
        boolean meetsMinimum = reservationService.checkMinimumOccupancy(date);
        return ResponseEntity.ok(Map.of(
                "date", date,
                "occupancyCount", count,
                "meetsMinimum25Percent", meetsMinimum));
    }
}
