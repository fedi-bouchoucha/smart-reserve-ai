package com.office.reservation.controller;

import com.office.reservation.dto.DayOffResponse;
import com.office.reservation.dto.ReservationResponse;
import com.office.reservation.entity.ReservationStatus;
import com.office.reservation.entity.User;
import com.office.reservation.repository.ReservationRepository;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.ChangeRequestService;
import com.office.reservation.service.DayOffService;
import com.office.reservation.service.ReservationService;
import com.office.reservation.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    private final ChangeRequestService changeRequestService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;
    private final DayOffService dayOffService;

    public ManagerController(ChangeRequestService changeRequestService,
            UserRepository userRepository,
            UserService userService,
            ReservationService reservationService,
            ReservationRepository reservationRepository,
            DayOffService dayOffService) {
        this.changeRequestService = changeRequestService;
        this.userRepository = userRepository;
        this.userService = userService;
        this.reservationService = reservationService;
        this.reservationRepository = reservationRepository;
        this.dayOffService = dayOffService;
    }

    @GetMapping("/employees/{id}/reservations")
    public ResponseEntity<?> getEmployeeReservations(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User manager = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        
        User employee = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Employee not found"));
        if (employee.getManager() == null || (!employee.getManager().getId().equals(manager.getId()) && !manager.getRole().name().equals("ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized access to employee reservations."));
        }
        
        return ResponseEntity.ok(reservationService.getUserReservations(id));
    }


    @GetMapping("/employees")
    public ResponseEntity<?> getMyEmployees(@AuthenticationPrincipal UserDetails userDetails) {
        User manager = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(userService.getEmployeesByManager(manager.getId()));
    }

    @GetMapping("/change-requests")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        User manager = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(changeRequestService.getPendingRequestsForManager(manager.getId()));
    }

    @PostMapping("/change-requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String comment = body != null ? body.get("comment") : null;
            return ResponseEntity.ok(changeRequestService.approveRequest(id, comment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/change-requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String comment = body != null ? body.get("comment") : null;
            return ResponseEntity.ok(changeRequestService.rejectRequest(id, comment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<List<ReservationResponse>> getPendingApprovals(
            @AuthenticationPrincipal UserDetails userDetails) {
        User manager = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(reservationService.getPendingApprovalsForManager(manager.getId()));
    }

    @PostMapping("/reservations/{id}/approve")
    public ResponseEntity<?> approveReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.updatePendingReservationStatus(id, ReservationStatus.CONFIRMED));
    }

    @GetMapping("/pending-days-off")
    public ResponseEntity<List<DayOffResponse>> getPendingDaysOff(
            @AuthenticationPrincipal UserDetails userDetails) {
        User manager = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dayOffService.getPendingDaysOffForManager(manager.getId()));
    }

    @PostMapping("/days-off/{id}/approve")
    public ResponseEntity<?> approveDayOff(@PathVariable Long id) {
        return ResponseEntity.ok(dayOffService.approveDayOff(id));
    }

    @PostMapping("/days-off/{id}/reject")
    public ResponseEntity<?> rejectDayOff(@PathVariable Long id) {
        return ResponseEntity.ok(dayOffService.rejectDayOff(id));
    }

    @PostMapping("/employees/{employeeId}/add")
    public ResponseEntity<?> addEmployeeToTeam(@PathVariable Long employeeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User manager = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            return ResponseEntity.ok(userService.addEmployeeToManager(manager.getId(), employeeId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/employees/{employeeId}/remove")
    public ResponseEntity<?> removeEmployeeFromTeam(@PathVariable Long employeeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User manager = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));
            userService.removeEmployeeFromManager(manager.getId(), employeeId);
            return ResponseEntity.ok(Map.of("message", "Employee removed from team"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/unassigned-employees")
    public ResponseEntity<?> getUnassignedEmployees() {
        return ResponseEntity.ok(userService.getUnassignedEmployees());
    }
}
