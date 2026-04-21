package com.office.reservation.controller;

import com.office.reservation.dto.AutoAssignmentResponse;
import com.office.reservation.dto.UserCreateRequest;
import com.office.reservation.dto.UserResponse;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.Role;
import com.office.reservation.repository.ReservationRepository;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.repository.ChangeRequestRepository;
import com.office.reservation.service.AutoAssignmentService;
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
    private final AutoAssignmentService autoAssignmentService;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;
    private final ChangeRequestRepository changeRequestRepository;

    public AdminController(UserService userService,
                          ReservationService reservationService,
                          ChangeRequestService changeRequestService,
                          AutoAssignmentService autoAssignmentService,
                          UserRepository userRepository,
                          ReservationRepository reservationRepository,
                          ChangeRequestRepository changeRequestRepository) {
        this.userService = userService;
        this.reservationService = reservationService;
        this.changeRequestService = changeRequestService;
        this.autoAssignmentService = autoAssignmentService;
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
        this.changeRequestRepository = changeRequestRepository;
    }

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

    @PutMapping("/users/{id}/archive")
    public ResponseEntity<?> archiveUser(@PathVariable Long id) {
        try {
            userService.archiveUser(id);
            return ResponseEntity.ok(Map.of("message", "User archived successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

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

        LocalDate today = LocalDate.now();
        stats.put("todayOccupancy", reservationService.getOccupancyCount(today));
        stats.put("totalReservations", reservationRepository.count());
        stats.put("totalChangeRequests", changeRequestService.getAllChangeRequests().size());
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reservations")
    public ResponseEntity<?> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/change-requests")
    public ResponseEntity<?> getAllChangeRequests() {
        return ResponseEntity.ok(changeRequestService.getAllChangeRequests());
    }



    /**
     * Auto-assign random chairs to employees who didn't reserve during the booking window (1st-20th).
     * Admin specifies the target year and month.
     */
    @PostMapping("/auto-assign")
    public ResponseEntity<?> autoAssignChairs(@RequestParam int year, @RequestParam int month) {
        try {
            AutoAssignmentResponse result = autoAssignmentService.autoAssignChairsForMonth(year, month);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
