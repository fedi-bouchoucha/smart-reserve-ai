package com.office.reservation.controller;

import com.office.reservation.dto.UserCreateRequest;
import com.office.reservation.dto.UserResponse;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.Role;
import com.office.reservation.repository.ReservationRepository;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.ChangeRequestService;
import com.office.reservation.service.ReservationService;
import com.office.reservation.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final ReservationService reservationService;
    private final ChangeRequestService changeRequestService;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    public AdminController(UserService userService,
            ReservationService reservationService,
            ChangeRequestService changeRequestService,
            UserRepository userRepository,
            ReservationRepository reservationRepository) {
        this.userService = userService;
        this.reservationService = reservationService;
        this.changeRequestService = changeRequestService;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
    }

    // User management
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody UserCreateRequest request) {
        try {
            return ResponseEntity.ok(userService.createUser(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserCreateRequest request) {
        try {
            return ResponseEntity.ok(userService.updateUser(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        long totalEmployees = userRepository.countByRole(Role.EMPLOYEE);
        long totalManagers = userRepository.countByRole(Role.MANAGER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);

        stats.put("totalUsers", totalEmployees + totalManagers + totalAdmins);
        stats.put("totalEmployees", totalEmployees);
        stats.put("totalManagers", totalManagers);
        stats.put("totalAdmins", totalAdmins);

        // Today's stats
        LocalDate today = LocalDate.now();
        stats.put("todayOccupancy", reservationService.getOccupancyCount(today));
        stats.put("todayMeetsMinimum", reservationService.checkMinimumOccupancy(today));

        // Total reservations
        stats.put("totalReservations", reservationRepository.count());
        stats.put("confirmedReservations",
                reservationRepository.countByDateAndStatus(today, ReservationStatus.CONFIRMED));

        // Weekly stats (current week Mon-Fri)
        LocalDate monday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        Map<String, Long> weeklyOccupancy = new HashMap<>();
        for (int i = 0; i < 5; i++) {
            LocalDate day = monday.plusDays(i);
            weeklyOccupancy.put(day.getDayOfWeek().name(),
                    reservationRepository.countByDateAndStatus(day, ReservationStatus.CONFIRMED));
        }
        stats.put("weeklyOccupancy", weeklyOccupancy);

        // Change requests
        stats.put("totalChangeRequests", changeRequestService.getAllChangeRequests().size());

        return ResponseEntity.ok(stats);
    }

    // All reservations
    @GetMapping("/reservations")
    public ResponseEntity<?> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    // All change requests
    @GetMapping("/change-requests")
    public ResponseEntity<?> getAllChangeRequests() {
        return ResponseEntity.ok(changeRequestService.getAllChangeRequests());
    }
}
