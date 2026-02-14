package com.office.reservation.controller;

import com.office.reservation.dto.ChangeRequestDTO;
import com.office.reservation.entity.User;
import com.office.reservation.repository.UserRepository;
import com.office.reservation.service.ChangeRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/change-requests")
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;
    private final UserRepository userRepository;

    public ChangeRequestController(ChangeRequestService changeRequestService,
            UserRepository userRepository) {
        this.changeRequestService = changeRequestService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createChangeRequest(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangeRequestDTO dto) {
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Map<String, Object> response = changeRequestService.createChangeRequest(user.getId(), dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(changeRequestService.getMyChangeRequests(user.getId()));
    }
}
