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
@PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
public class ManagerController {

    private final ChangeRequestService changeRequestService;
    private final UserRepository userRepository;
    private final com.office.reservation.service.UserService userService;

    public ManagerController(ChangeRequestService changeRequestService,
            UserRepository userRepository,
            com.office.reservation.service.UserService userService) {
        this.changeRequestService = changeRequestService;
        this.userRepository = userRepository;
        this.userService = userService;
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
}
