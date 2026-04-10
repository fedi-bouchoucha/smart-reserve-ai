package com.office.reservation.controller;

import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.ChangeRequestService;
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
    private final com.office.reservation.service.UserService userService;
    private final com.office.reservation.service.ReservationService reservationService;
    private final com.office.reservation.repository.ReservationRepository reservationRepository;

    public ManagerController(ChangeRequestService changeRequestService,
            UserRepository userRepository,
            com.office.reservation.service.UserService userService,
            com.office.reservation.service.ReservationService reservationService,
            com.office.reservation.repository.ReservationRepository reservationRepository) {
        this.changeRequestService = changeRequestService;
        this.userRepository = userRepository;
        this.userService = userService;
        this.reservationService = reservationService;
        this.reservationRepository = reservationRepository;
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

    @DeleteMapping("/reservations/{id}")
    public ResponseEntity<?> deleteUserReservation(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User manager = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        
        com.office.reservation.entity.Reservation res = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (res.getUser().getManager() == null || (!res.getUser().getManager().getId().equals(manager.getId()) && !manager.getRole().name().equals("ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized to delete this reservation."));
        }
        
        reservationRepository.delete(res);
        return ResponseEntity.ok(Map.of("message", "Reservation deleted successfully."));
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
    public ResponseEntity<List<com.office.reservation.dto.ReservationResponse>> getPendingApprovals(
            @AuthenticationPrincipal UserDetails userDetails) {
        User manager = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(reservationService.getPendingApprovalsForManager(manager.getId()));
    }

    @PostMapping("/reservations/{id}/approve")
    public ResponseEntity<?> approveReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.updatePendingReservationStatus(id, com.office.reservation.entity.ReservationStatus.CONFIRMED));
    }

    @PostMapping("/reservations/{id}/reject")
    public ResponseEntity<?> rejectReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.updatePendingReservationStatus(id, com.office.reservation.entity.ReservationStatus.CANCELLED));
    }
}
